import re

# Read IR from output.txt
def read_ir(filename):
    ir = []
    with open(filename, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t")
            if len(parts) != 2:
                continue
            instr = parts[1].strip("()")
            fields = [x.strip() for x in instr.split(",")]
            while len(fields) < 4:
                fields.append('')
            ir.append(tuple(fields))
    return ir

# Register helpers
reg_map = {}
reg_counter = 0

def get_reg(name):
    global reg_counter
    if name not in reg_map:
        reg_map[name] = f"x{reg_counter}"
        reg_counter += 1
    return reg_map[name]

def is_immediate(val):
    return val.startswith("#")

def is_memory(val):
    return val.startswith("@")

def format_operand(val):
    if is_immediate(val):
        return f"#{val[1:]}"
    elif is_memory(val):
        return f"[{get_reg(val[1:])}]"
    else:
        return get_reg(val)

# ARM code generator
def generate_arm(ir):
    print_flag = False
    loop_flag = False
    code = []
    labels = {}

    # Label resolution
    for i, (op, a1, a2, a3) in enumerate(ir):
        if op == "JP" and a1.isdigit():
            labels[int(a1)] = f"LABEL_{a1}"
        elif op == "JPF" and a2.isdigit():
            labels[int(a2)] = f"LABEL_{a2}"

    code.append(".global _start")
    code.append(".section .text")
    code.append("_start:")
    
    for i, (op, a1, a2, a3) in enumerate(ir):
        if i in labels:
            code.append(f"{labels[i]}:")

        if op == "ASSIGN":
            src, dst = a1, a2
            if is_memory(dst):
                tmp = get_reg("tmp")
                code.append(f"MOV {tmp}, {format_operand(src)}")
                code.append(f"STR {tmp}, {format_operand(dst)}")
            elif is_memory(src):
                code.append(f"LDR {get_reg(dst)}, {format_operand(src)}")
            else:
                code.append(f"MOV {get_reg(dst)}, {format_operand(src)}")

        elif op in {"ADD", "SUB", "MULT"}:
            r1 = get_reg("tmp1")
            r2 = get_reg("tmp2")
            rd = get_reg(a3)
            code.append(f"MOV {r1}, {format_operand(a1)}")
            code.append(f"MOV {r2}, {format_operand(a2)}")
            arm_op = {"ADD": "ADD", "SUB": "SUB", "MULT": "MUL"}[op]
            code.append(f"{arm_op} {rd}, {r1}, {r2}")

        elif op == "LT":
            r1 = get_reg("tmp1")
            r2 = get_reg("tmp2")
            rd = get_reg(a3)
            code.append(f"MOV {r1}, {format_operand(a1)}")
            code.append(f"MOV {r2}, {format_operand(a2)}")
            code.append(f"CMP {r1}, {r2}")
            code.append(f"CSET {rd}, LT")

        elif op == "JPF":
            cond, target = a1, a2
            rc = get_reg("tmp_cond")
            code.append(f"MOV {rc}, {format_operand(cond)}")
            code.append(f"CMP {rc}, #0")
            if target.isdigit():
                code.append(f"BEQ {labels[int(target)]}")

        elif op == "JP":
            if is_memory(a1):
                r = get_reg("jmp_ptr")
                code.append(f"LDR {r}, {format_operand(a1)}")
                code.append(f"BR {r}")
            elif a1.isdigit():
                code.append(f"B {labels[int(a1)]}")

        elif op == "PRINT":
            r = get_reg("tmp_print")
            code.append(f"MOV {r}, {format_operand(a1)}")
            code.append("MOV x0, #1")               # stdout
            code.append(f"MOV x1, {r}")             # value to print
            code.append("BL print_int")             # call helper
            print_flag=True

        elif op == "EQ":
            r1 = get_reg("tmp1")
            r2 = get_reg("tmp2")
            rd = get_reg(a3)
            code.append(f"MOV {r1}, {format_operand(a1)}")
            code.append(f"MOV {r2}, {format_operand(a2)}")
            code.append(f"CMP {r1}, {r2}")
            code.append(f"CSET {rd}, EQ")
        
        elif op == "PLACEHOLDER" : 
            continue

        else:
            code.append(f"; Unsupported: {op} {a1} {a2} {a3}")

    # Add helper function for printing integer
    if print_flag: 
        code += [
        "",
        "print_int:",
        "    MOV x2, x1",           # x2 = value
        "    MOV x3, #10",
        "    ADR x4, int_buf+20",
        "    MOV x5, #0",

        "print_loop:",
        "    UDIV x6, x2, x3",
        "    MUL x7, x6, x3",
        "    SUB x8, x2, x7",
        "    ADD x8, x8, #'0'",
        "    SUB x4, x4, #1",
        "    STRB w8, [x4]",
        "    MOV x2, x6",
        "    ADD x5, x5, #1",
        "    CBNZ x6, print_loop",

        "    MOV x0, #1",
        "    MOV x1, x4",
        "    MOV x2, x5",
        "    MOV x8, #64",  # syscall: write
        "    SVC #0",
        "    RET",
        "",
        ".section .bss",
        "int_buf: .skip 20"
    ]

    return code

# Write to .s file
def write_arm(filename, lines):
    with open(filename, "w") as f:
        for line in lines:
            f.write(line + "\n")

def main():
    ir = read_ir("output/output.txt")
    print(ir)
    if not ir:
        print("error in IR to ARM")
        arm_code = ["; Header file not supported or IR is empty"]
    else:    
        arm_code = generate_arm(ir)
    write_arm("armv8_output.s", arm_code)
    print("ARMv8 code written to armv8_output.s.")


if __name__ == "__main__":
    main()

