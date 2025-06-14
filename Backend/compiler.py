import os
import sys
import time
import argparse
import platform
import subprocess as sp

# Setup paths
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(script_dir, "modules"))

# Imports from modules
from cparser import Parser
from scanner import Scanner, SymbolTableManager
from semantic_analyser import SemanticAnalyser
from code_gen import CodeGen, MemoryManager
from ir_to_armv8 import main as genARM

# Max virtual memory for program execution (in bytes)
MAX_VIRTUAL_MEMORY = 50 * 1024 * 1024  # 50 MB

def limit_virtual_memory():
    import resource
    resource.setrlimit(resource.RLIMIT_AS, (MAX_VIRTUAL_MEMORY, MAX_VIRTUAL_MEMORY))

def compile(args):
    flag_lex=False
    flag_syn=False
    flag_sem=False
    print("Compiling", args.source_file)
    SymbolTableManager.init()
    MemoryManager.init()
    
    parser = Parser(args.source_file)

    start = time.time()
    parser.parse()
    elapsed = time.time() - start
    print(f"Compilation took {elapsed:.6f} s")

    # Save various outputs based on flags
    if args.abstract_syntax_tree:
        parser.save_parse_tree()
    if args.symbol_table:
        parser.scanner.save_symbol_table()
    if args.tokens:
        parser.scanner.save_tokens()
    if args.error_files:
        parser.save_syntax_errors()
        parser.scanner.save_lexical_errors()
        parser.semantic_analyzer.save_semantic_errors()
    
    parser.code_generator.save_output()

    # Collect errors
    lexical_errors = parser.scanner.lexical_errors.strip()
    syntax_errors = parser.syntax_errors.strip()
    semantic_errors = parser.semantic_analyzer.semantic_errors.strip()
    if lexical_errors!="There is no lexical errors.":
        flag_lex=True
    if syntax_errors!="There is no syntax error.":
        flag_syn=True
    if semantic_errors!="The input program is semantically correct.":
        flag_sem=True
    has_errors = bool(flag_lex or flag_sem or flag_syn)

    if has_errors:
        print("Compilation failed due to the following errors:\n")
        if lexical_errors:
            print("Lexical Errors:\n" + lexical_errors)
        if syntax_errors:
            print("Syntax Errors:\n" + syntax_errors)
        if semantic_errors:
            print("Semantic Errors:\n" + semantic_errors)

        # Save errors to ARM output file
        output_path = os.path.join(script_dir, "armv8_output.s")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w") as f:
            if lexical_errors:
                f.write("Lexical Errors:\n" + lexical_errors + "\n\n")
            if syntax_errors:
                f.write("Syntax Errors:\n" + syntax_errors + "\n\n")
            if semantic_errors:
                f.write("Semantic Errors:\n" + semantic_errors + "\n")
        return  # Do not proceed to code generation or execution
    else:
        print("Compilation successful!")
        genARM()

    # Run the program if requested
    if args.run:
        print("Executing compiled program")
        plat = platform.system()

        # Choose the correct tester based on OS
        if plat == "Windows":
            tester_file = os.path.join(script_dir, "interpreter", "tester_Windows.exe")
        elif plat == "Linux":
            tester_file = os.path.join(script_dir, "interpreter", "tester_Linux.out")
        elif plat == "Darwin":
            tester_file = os.path.join(script_dir, "interpreter", "tester_Mac.out")
        else:
            raise RuntimeError("Unsupported operating system!")

        output_file = os.path.join(script_dir, "output", "output.txt")
        output_dir = os.path.dirname(output_file)

        if os.path.exists(output_file):
            preexec_fn = limit_virtual_memory if plat == "Linux" else None
            stderr = sp.PIPE if not args.verbose else None

            try:
                start = time.time()
                tester_output = sp.check_output(
                    tester_file,
                    cwd=output_dir,
                    stderr=stderr,
                    timeout=10,
                    preexec_fn=preexec_fn
                ).decode("utf-8")
                elapsed = time.time() - start
                if not args.verbose:
                    tester_output = "\n".join([
                        line.replace("PRINT", "").strip()
                        for line in tester_output.splitlines()
                        if line.startswith("PRINT")
                    ])
                print(f"Execution took {elapsed:.6f} s")
                print("Program output:")
                print(tester_output)
            except sp.TimeoutExpired:
                print("RuntimeError: Execution timed out!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple C Compiler written in Python')
    parser.add_argument("source_file", help="Path to C source file.")
    parser.add_argument('-r', '--run', action='store_true', help='Run the output program after compilation.')
    parser.add_argument('-v', '--verbose', action='store_true', help='Print all used three address codes.')
    parser.add_argument('-ef', '--error-files', action='store_true', help='Save compilation errors to text files.')
    parser.add_argument('-ast', '--abstract-syntax-tree', action='store_true', help='Save abstract syntax tree into a text file.')
    parser.add_argument('-st', '--symbol-table', action='store_true', help='Save symbol table into a text file.')
    parser.add_argument('-t', '--tokens', action='store_true', help='Save lexed tokens into a text file.')
    
    args = parser.parse_args()

    # Fix: Convert to absolute path properly
    if not os.path.isabs(args.source_file):
        args.source_file = os.path.abspath(args.source_file)

    compile(args)
