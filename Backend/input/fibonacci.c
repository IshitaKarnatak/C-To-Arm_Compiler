/* 
 * Example source code
 * 
 * prints N numbers from Fibonacci sequence
 */

void main(void) {
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
}