import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import Sidebar from '@/components/Sidebar';
import ThemeProvider from '@/components/ThemeProvider';

type Theme = 'cyberpunk' | 'matrix' | 'minimal' | 'basic' | 'girly';

const Index = () => {
  const [theme, setTheme] = useState<Theme>('basic');
  const [code, setCode] = useState(`void main(void) {
    output(1234);
}`);
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationSuccess, setCompilationSuccess] = useState<boolean | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context for sound effects
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  const playSound = (frequency: number, duration: number, type: 'success' | 'error') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type === 'success' ? 'sine' : 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const getThemeFont = () => {
    return theme === 'cyberpunk' ? 'font-cyber' :
           theme === 'matrix' ? 'font-code' :
           theme === 'basic' ? 'font-basic' :
           theme === 'girly' ? 'font-girly' :
           'font-cyber';
  };

  const getThemeBackground = () => {
    return theme === 'cyberpunk' ? 'bg-gradient-to-br from-cyber-dark via-cyber-darker to-cyber-gray' :
           theme === 'matrix' ? 'bg-black matrix-bg' :
           theme === 'basic' ? 'basic-bg' :
           theme === 'girly' ? 'girly-bg' :
           'minimal-bg';
  };

  const getHeaderClass = () => {
    const baseClass = "border-b p-4";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} glass-panel border-neon-blue/20`;
    } else if (theme === 'matrix') {
      return `${baseClass} glass-panel border-neon-green/20`;
    } else if (theme === 'basic') {
      return `${baseClass} basic-panel border-basic-blue/20`;
    } else if (theme === 'girly') {
      return `${baseClass} girly-panel border-girly-pink/20`;
    } else {
      return `${baseClass} glass-panel border-neon-blue/20`;
    }
  };

  const getTitleClass = () => {
    const baseClass = "text-3xl font-black tracking-wider";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} text-neon-blue animate-neon-flicker`;
    } else if (theme === 'matrix') {
      return `${baseClass} text-neon-green`;
    } else if (theme === 'basic') {
      return `${baseClass} text-basic-dark`;
    } else if (theme === 'girly') {
      return `${baseClass} text-girly-rose animate-bounce-soft`;
    } else {
      return `${baseClass} text-white`;
    }
  };

  const getCardClass = (accent: 'blue' | 'violet') => {
    const baseClass = "h-full overflow-hidden";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} glass-panel border-neon-${accent}/30`;
    } else if (theme === 'matrix') {
      return `${baseClass} glass-panel border-neon-green/30`;
    } else if (theme === 'basic') {
      return `${baseClass} basic-panel border-basic-blue/30`;
    } else if (theme === 'girly') {
      return `${baseClass} girly-panel border-girly-${accent === 'blue' ? 'pink' : 'rose'}/30`;
    } else {
      return `${baseClass} glass-panel border-neon-${accent}/30`;
    }
  };

  const getCompileButtonClass = () => {
    const baseClass = `px-8 py-4 text-lg font-bold rounded-lg transition-all duration-300 ${isCompiling ? 'animate-compile-pulse' : 'hover:scale-105'}`;
    
    if (theme === 'cyberpunk') {
      return `${baseClass} bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-violet hover:to-neon-blue border-2 border-neon-blue neon-glow`;
    } else if (theme === 'matrix') {
      return `${baseClass} bg-gradient-to-r from-neon-green to-green-600 hover:from-green-600 hover:to-neon-green border-2 border-neon-green`;
    } else if (theme === 'basic') {
      return `${baseClass} bg-gradient-to-r from-basic-blue to-blue-600 hover:from-blue-600 hover:to-basic-blue border-2 border-basic-blue basic-shadow`;
    } else if (theme === 'girly') {
      return `${baseClass} bg-gradient-to-r from-girly-pink to-girly-rose hover:from-girly-rose hover:to-girly-pink border-2 border-girly-pink girly-glow`;
    } else {
      return `${baseClass} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600`;
    }
  };

  const compileCode = async () => {
    setIsCompiling(true);
    setOutput('');
    setCompilationSuccess(null);
    setWaitingForInput(false);

    try {
      const response = await fetch('http://localhost:5000/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      setOutput(result.output);
      setCompilationSuccess(result.success);

      if (result.success) {
        toast({
          title: "Compilation Successful! ⚡",
          description: "Your C code has been compiled to ARMv8 assembly.",
        });
      } else {
        toast({
          title: "Compilation Failed ❌",
          description: "There are errors in your code. Check the console output.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during compilation:", error);
      setOutput("An error occurred during compilation.");
      setCompilationSuccess(false);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleUserInput = (input: string) => {
  // If you want, implement interactive input handling here.
  // Currently, this function is a placeholder because interactive input is not supported.
};


  const loadSampleCode = () => {
    const samples = [
      `void main(void) {
    int i;
    int N;
    int a;
    int b;
    int tmp;

    i = 0;
    a = 0;
    b = 1;
    tmp = 0;

    N = 20; 

    output(0);

    while (i < N) {
        output(a + b);
        tmp = b;
        b = a + tmp;
        a = tmp;
        i = i + 1;
    }
}`,
      `int abs(int a) {
    if (a < 0) {
        return 0-a;
    } else {
        return a;
    }
}

int isMultiplier(int a, int b) {
    int i;
    int step;
    int flag;

    if (b == 0) {
        return 0;
    } else {
        i = 1;
        flag = 0;
    }

    if (a < 0) {
        if (b < 0) {
            i = 1;
        } else {
            i = 0-1;
        }
    } else {
        if (b < 0) {
            i = 0-1;
        } else {
            i = 1;
        }
    }

    step = i;
    i = i - abs(i);
    while (abs(i) < abs(a) + 1) {
        if (i * b == a) {
            flag = 1;
            break;
        } else {
            i = i + step;
            continue;
        }
    }
    return flag;

}


void main(void) {
    int i;
    int j;
    int sum;
    int N;
    
    i = 1;
    j = 1;

    N = 5; 

    while (i < N * 2 + 1) {
        sum = 0;
        j = 0;
        while (j < i) {
            j = j + 1;
            if (isMultiplier(j, 2)) {
                sum = sum + 0;
            } else {
                sum = sum + j;
            }
        }
        output(sum);
        i = i + 2;

    }

}`,  `void main(void) {
    /* all variables need to be declared first */
    int i;
    int j;
    int m;
    int N;
    
    /* ...and then assigned to */
    i = 1;
    j = 1;
    m = 0-1; // syntax only supports binary operations, this is how we get -1

    N = 15; // change me to increase number of odd numbers

    while (i < N * 2 + 1) {
        j = m * j;
        if (j < 0) {
            output(i);
        } else {
            // do nothing, the syntax does not support if without else :^)
        }
        i = i + 1;
    }
}`,`void main(void) {
    int i;
    i = 0;
    while (i < 10) {
        output(i);
        i = i + 1;
    }
}`,
`int count;
int result[50];

int f(int a, int result[]) {
    count = count + 1;
    if(result[a - 1]){
        return result[a - 1];
    } else {
        if (a == 1) {
            result[a - 1] = 1;
            return 1;
        } else if (a == 2){
            result[a - 1] = 1;
            return 1;
        } else {
            result[a - 1] = f(a - 2, result) + f(a - 1, result);
            return result[a - 1];
        }
    }
}

void main(void) {
    int i;
    i = 0;
    while (i < 50) {
        result[i] = 0;
        i = i + 1;
    }
    count = 0;
    output(f(40, result));
    output(count);
}`,
`int count;
int result[50];


int f(int a, int result[]) {
    count = count + 1;
    if(result[a - 1]){
        return result[a - 1];
    } else {
        if (a == 1) {
            result[a - 1] = 1;
            return 1;
        } else if (a == 2){
            result[a - 1] = 1;
            return 1;
        } else {
            result[a - 1] = f(a - 2, result) + f(a - 1, result);
            return result[a - 1];
        }
    }
}

void man ( void ) {
    int i;
    i = 0;
	while (i < 50) {
        result[i] = 0;
        i = i + 1;
    }
    count = 0;
    output(f(40, result));
    output(count);
}`,
`int cou;
int result[50];


int f(int a, int result[]) {
    count = count + 1;
    if(result[a - 1]){
        return result[a - 1];
    } else {
        if (a == 1) {
            result[a - 1] = 1;
            return 1;
        } else if (a == 2){
            result[a - 1] = 1;
            return 1;
        } else {
            result[a - 1] = f(a - 2, result) + f(a - 1, 50);
            return result[a - 1];
        }
    }
}

void main(void) {
    int i;
	i = 0;
    while (i < 50) {
        result[i] = 0;
        i = i + result;
    }
    count = 0;
    output(f(40, result));
    output(count);
}`,
`int count;
int result[50];


int f(int a, int result[]) {
    count = count + 1;
    if(result[a - 1]){
        return result[a - 1];
    } else {
        if (a == 1) {
            result[a - 1] = 1;
            return 1;
        } else if (a == 2){
            result[a - 1] = 1;
            return 1;
        } else {
            result[a - 1] = f(a - 2, result) + f(a - 1, result);
            return result[a - 1];
        }
    }
}

void main ( void ) {
    int i;
	void j;
    i = 0;
	break;
	while (i < 50) {
        result[i] = 0;
        i = i + 1;
    }
    count = 0;
    output(f(40));
    output(count);
}`,
`void f(int a, int result[]) {
	count = a;                /* count not defined? */
}

int count;
int result[50];

int main ( void ) {
    int i;
    void a;
    i = result;                /* type mismatch? */
    count = f(i, result);      /* function returns void */
	f(i + a, i * result);      /* what are the types of the arguments? */
    if (a == f(i, result)) {   /* void types match in comparison? */
        continue;              /* not inside while although properly nested */
    } else {
    return 0;}
}`,
`/*sample 6*/
void main(void{
	int prod;
	int i;
		prod = 1;
		i = 1;
}
`,
`/*sample 5*/
int f(int a){
return a * a;
}
void main(void){
int a;
int b;
b =1; 
if (b < 5) {
a = f(b);
}
else{
a = 4;
}
}
`,
`/*sample 4*/
void main(){
	int a;
	int b;
		a = b + 1;
}
`,
`/*sample 3*/
void main (void) {
int a;
int b;
 b = 1;
 a = 2;
	switch (a){
		case 2:
			b = b + 1;
		case 3:
			b = b + 2;
			return;
		case 4:
		{
			a = 5;
			b = a * 123;
			break;}
		default:
			b = b - 1;
	}
	return;
}
`,
`/*sample 2*/
void main(void){
	int prod;
	int i;
		prod = 1;
		i = 1;
	while(i < 7){
		prod = i * prod ;
		i = i + 2;
	}
		output(prod);
		return;

}
`,
`/* sample 1 */
void main(void){
	int a;
	int b;
		a = b + 1;
}
`,
`int f(int a){
return a * a * a;
}
void main(void){
int a;
int b;
a = 8;
if (b < 5) {
a = f(a);
}
else{
a = 4;
}

continue;
}`,
`/* test case */
void main(void){
	int prod;
	int i;
		prod = 1;
		i = 1;
	while(i < 7){
		prod = i * prod ;
		i = i + 2;
	}
		output(prod);
		return;

}
`,
`/* test case */
void main(void){
	int prod;
	int i;
		prod = 1;
		i = 1;
	while(i < 7){
		prod = i * prod ;
		i = i + 2;
	}
		output(prod);
		return;

}
`,
`void min(void){
	switch (arr[g]){
		case 2:
			b = b + 1; */
		case 3:
			b = b + 2;
			return;
		case 4:
		{
			x = 5;
			b = u * 123;
			break;}
		default:/*this is wrong *
			b = b - 1;
	}
	return;
}
`,
`void (main) void {
    int a = 0;
    // comment1
    a = 2 + 2;
    a = a - 3;
    cde = a;
    if (b /* comment2 */ == 3) {
        a = 3;
        cd!e = 7;
    }
    else
    {
        b = a < cde;
        {cde = @2;
    }}
    return;
}
`,
`int b;
int foo(int d, int e){
    int f;
	f = foo(d);
	b = e + f;
	whi$le(d < 0){
		f = f + d;
		d = d - 1;
		if (d == 5)
			break;
		else d = 1dst;
	}
	//comment1
	return f + b;
}
int arr[3];
void main(void){
	int a;
	a = 3 + 11;
	b = 5 * a + foo(a, a);
	arr[1] = b + 3;
	arr[2] = foo(arr[0], arr[1]);
	if (b /*comment2*/ == 3){
		arr[0] = 7;	
	}
	else
	{
		switch (arr[2]){
			case 2:
				b = b + 1;
			case 3:
				b = b + 2;
				return;
			case :
			{
				u = 5;
				b = u * 123;
				break;}
			default:
				b = b - 1;
		}	
	}
	return;
}
`,
`/* test case 2*/
void main(void){
	int a;
	int b;
	a = 10 * 2 + 3 * (1 < 0);
	b = (a == 5) * 4 + 3;
	output(a);
	output(b);
}
`,
`/* test case 3*/
int foo(int x){
	if (x < 0){
		output(x);
		return 1;
	}
	else {
		output(x);
		return x + 2;
	}
}
void main(void){
	int i;	
	i= foo(0);
	output(i);
	i=foo(10);
	output(i);
}
`,
`/* test case 4*/
int foo(int a, int b){
	int bar(int a){
		return a + 2;
	}
	return a + bar(b);
}
void main(void){
	output(foo(1, 10));
}
`,
`/* test case 5*/
int f(int a) {
    void g(int b) {
        output(b);
        f(b - 1);
    }
    if (a == 1) {
        output(a);
        return 0;
    } else {
        g(a);
    }


}


void main(void) {
    f(10);
}
`,
`/* test case 6*/
void foo(int x){
	
switch(x){
	case 0:
		{ int a; }
	case 1:
		{output(2);
		break;}
	case 3:
		output(3);
		break;
	deflt:
		output(4);
	}
}
void main ( void )

{
}

`,
`int foo(int x){
	int a;
	a = 10;
	output(x);
	if(a < x) {
		return(1);
	}
	 {
		return(2);
	}
}
void main  ( void )
{
	int i;
	i = foo (4);
	output (i);
}

`,
`/* test case 8*/
int fact ( int n )
{
    int f;
    if ( n = 1 )f = 1;
    else 
        f = n * * factorial ( n - 1 );
    return f;
}
void main ( void )
{
     output ( factorial (3) );
}

`,
`int f(int a) {
    void g(int b) {
        output(b);
        f(b - 1);
    }
    if (a == ) {
        output(a);
        return 0;
    } else {
        g(a);
    }

}


void main(void) {
    f(10);
}
`,
`int count;
int result[50];


int f(int a, int result[]) {
    count = count + 1;
    if(result[a - 1]){
        return result[a - 1];
    } else {
        if (a == 1) {
            result[a - 1] = 1;
            return 1;
        } else if (a == 2){
            result[a - 1] = 1;
            return 1;
        } else {
            result[a - 1] = f(a - 2, result) + f(a - 1, result);
            return result[a - 1)];
        }
    }
}

void main(void) {
    int i;
    i = 0;
    while (i < 50) {
        result[i] = 0; ;
        i = i + 1;
    }
    count = 0;
    output(f(40, result));
    output(count);
}
`,
`/* test case 1*/
void main(void){
	int prod;
	int i;
		prod = 1;
		i = 1;
	while(i < 7){
		prod = i * prod ;
		i = i + 2;
	}
		output(prod);
		return;

}
`,
`/*===== nested functions =====*/
int foo(int a, int b){
	int bar(int a){
		return a + 2;
	}
	return a + bar(b);
}
void main(void){
	output(foo(1, 10));
}
`,
`/*=== recursive factorial ====*/
int factorial ( int n )
{
    int f;
    if ( n == 1 )f = 1;
    else 
        f = n * factorial ( n - 1 );
    return f;
}
void main ( void )
{
     output ( factorial (3) );
}

`,
`/* test case */
void main(void){
	int prod;
	int i;
		prod = 1;
		i = 1;
	while(i < 7){
		prod = i * prod ;
		i = i + 2;
	}
		output(prod);
		return;

}
`,
`/*==== expressions/relop =====*/
void main(void){
	int a;
	int b;
	a = 10 * 2 + 3 * (1 < 0);
	b = (a == 5) * 4 + 3;
	output(a);
	output(b);
}
`,
`/*===== if else =====*/
int foo(int x){
	if (x < 0){
		output(x);
		return 1;
	}
	else {
		output(x);
		return x + 2;
	}
}
void main(void){
	int i;	
	i= foo(0);
	output(i);
	i=foo(10);
	output(i);
}
`,
`int a;
int b;

void main(void) {
    int c;
    int d;
    a = c = 1;
    d = b = 3;
    output(a);
    output(b);
    c = a * 17 < 15 + 3;
    output(c);
    output(d < 3);
    output(d - 8 < 3);
    output(1 * 2);


}
`,
`/*==== return in conditionals =====*/
int foo(int x){
	int a;
	a = 10;
	output(x);
	if(a < x){
		return(1);
	}
	else {
		return(2);
	}
}
void main ( void )
{
	int i;
	i = foo (4) ;
	output (i);
}

`,
`/*===== switch case =====*/
void foo(int x){
	switch(x){
	case 0:
		output(1);
	case 1:
		output(2);
		break;
	case 3:
		output(3);
		break;
	default:
		output(4);
	}
}
void main ( void )
{
     foo (3) ;
}

`,
`/*=== Hard == */
int abs(int a) {
    if (a < 0) {
        return 0-a;
    } else {
        return a;
    }
}

int isMultiplier(int a, int b) {
    int i;
    int step;
    int flag;

    if (b == 0) {
        return 0;
    } else {
        i = 1;
        flag = 0;
    }

    if (a < 0) {
        if (b < 0) {
            i = 1;
        } else {
            i = 0-1;
        }
    } else {
        if (b < 0) {
            i = 0-1;
        } else {
            i = 1;
        }
    }

    step = i;
    i = i - abs(i);
    while (abs(i) < abs(a) + 1) {
        if (i * b == a) {
            flag = 1;
            break;
        } else {
            i = i + step;
            continue;
        }
    }
    return flag;

}


void main(void) {
    int i;
    int j;
    int sum;
    i = 1;
    j = 1;
    while (i < 11) {
        sum = 0;
        j = 0;
        while (j < i) {
            j = j + 1;
            if (isMultiplier(j, 2)) {
                sum = sum + 0;
            } else {
                sum = sum + j;
            }
        }
        output(sum);
        i = i + 1;

    }

}
`,
`void printArray(int A[], int size)
{
    int i;
    i = 0;
    while(i < size){
        output(A[i]);
        i = i + 1;
    }
}

void main(void)
{
    int arr[20];
    int arrsize;
    int i;
    int j;
    arrsize = 20;
    i = 0;
    while(i < arrsize){
	j = 0;
	arr[i] = 2;        
	while (j < i) { 
		arr[i] = arr[i] * 2;
		j = j + 1;
	}        
	i = i + 1;
    }

    printArray(arr, arrsize);
}
`,
`void main(void)
{
    int i; int j;
    int a; int N;
    i = 0-1;
    a = 1;
    j = 1;
    N = 50; // prints this many even numbers xd 
    while (j < 2 * N + 1) {
        a = a * i;
        if (a < 0) {
        } else {
            output(j);
        }
        j = j + 1;
    }
}
`,
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setCode(randomSample);
    
    toast({
      title: "Sample Code Loaded! 📝",
      description: "A new code sample has been loaded into the editor.",
    });
  };

  const resetEditor = () => {
    setCode('');
    setOutput('');
    setCompilationSuccess(null);
    setWaitingForInput(false);
    
    toast({
      title: "Editor Reset! 🔄",
      description: "The editor has been cleared.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.c')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        toast({
          title: "File Uploaded! 📁",
          description: `${file.name} has been loaded into the editor.`,
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File Type ❌",
        description: "Please upload a .c file.",
        variant: "destructive",
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={`min-h-screen ${getThemeFont()} transition-all duration-500 ${getThemeBackground()}`}>
        {/* Header */}
        <header className={getHeaderClass()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className={getTitleClass()}>
                ⚡ C To ARM
              </h1>
              <span className="text-sm text-gray-400">
                {theme === 'basic' ? 'Simple C to ARM Compiler' :
                 theme === 'girly' ? 'Cute C to ARM Compiler ✨' :
                 'Cyberpunk C to ARM Compiler'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                <SelectTrigger className={`w-40 ${theme === 'basic' ? 'basic-panel border-basic-blue/50' : theme === 'girly' ? 'girly-panel border-girly-pink/50' : 'glass-panel border-neon-violet/50'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`${theme === 'basic' ? 'basic-panel border-basic-blue/50' : theme === 'girly' ? 'girly-panel border-girly-pink/50' : 'glass-panel border-neon-violet/50'}`}>
                  <SelectItem value="cyberpunk">🌆 Cyberpunk</SelectItem>
                  <SelectItem value="matrix">🔢 Matrix</SelectItem>
                  <SelectItem value="basic">⚪ Basic</SelectItem>
                  <SelectItem value="girly">💕 Girly</SelectItem>
                  <SelectItem value="minimal">✨ Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <Sidebar
            onFileUpload={handleFileUpload}
            onLoadSample={loadSampleCode}
            onReset={resetEditor}
            theme={theme}
          />

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Code Editor Panel */}
            <div className="flex-1 p-4">
              <Card className={getCardClass('blue')}>
                <div className="h-full flex flex-col">
                  <div className={`p-3 border-b flex items-center justify-between ${
                    theme === 'cyberpunk' ? 'border-neon-blue/20 bg-cyber-gray/50' :
                    theme === 'matrix' ? 'border-neon-green/20 bg-black/50' :
                    theme === 'basic' ? 'border-basic-blue/20 bg-gray-50' :
                    theme === 'girly' ? 'border-girly-pink/20 bg-pink-50/30' :
                    'border-neon-blue/20 bg-white/10'
                  }`}>
                    <h2 className={`font-semibold ${
                      theme === 'cyberpunk' ? 'text-neon-blue' :
                      theme === 'matrix' ? 'text-neon-green' :
                      theme === 'basic' ? 'text-basic-dark' :
                      theme === 'girly' ? 'text-girly-rose' :
                      'text-white'
                    }`}>
                      C Source Code
                    </h2>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    theme={theme}
                  />
                </div>
              </Card>
            </div>

            {/* Output Panel */}
            <div className="flex-1 p-4">
              <Card className={getCardClass('violet')}>
                <div className="h-full flex flex-col">
                  <div className={`p-3 border-b flex items-center justify-between ${
                    theme === 'cyberpunk' ? 'border-neon-violet/20 bg-cyber-gray/50' :
                    theme === 'matrix' ? 'border-neon-green/20 bg-black/50' :
                    theme === 'basic' ? 'border-basic-blue/20 bg-gray-50' :
                    theme === 'girly' ? 'border-girly-rose/20 bg-pink-50/30' :
                    'border-neon-violet/20 bg-white/10'
                  }`}>
                    <h2 className={`font-semibold ${
                      theme === 'cyberpunk' ? 'text-neon-violet' :
                      theme === 'matrix' ? 'text-neon-green' :
                      theme === 'basic' ? 'text-basic-dark' :
                      theme === 'girly' ? 'text-girly-rose' :
                      'text-white'
                    }`}>
                      {waitingForInput ? 'Program Output & Input' : 'ARM Assembly Output'}
                    </h2>
                    {compilationSuccess !== null && (
                      <div className={`px-2 py-1 rounded text-xs ${
                        compilationSuccess 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {compilationSuccess ? '✅ SUCCESS' : '❌ ERROR'}
                      </div>
                    )}
                  </div>
                  
                  <ConsoleOutput
                    output={output}
                    isCompiling={isCompiling}
                    success={compilationSuccess}
                    theme={theme}
                    onUserInput={handleUserInput}    // <- corrected prop and function name
                    waitingForInput={waitingForInput}
                    inputPrompt={inputPrompt}
                  />

                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Floating Compile Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={compileCode}
            disabled={isCompiling || waitingForInput}
            className={getCompileButtonClass()}
          >
            {isCompiling ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Compiling...
              </>
            ) : waitingForInput ? (
              <>
                {theme === 'girly' ? '💬 Running...' : '⚙️ Running...'}
              </>
            ) : (
              <>
                {theme === 'girly' ? '💖 Compile' : '⚡ Compile'}
              </>
            )}
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
