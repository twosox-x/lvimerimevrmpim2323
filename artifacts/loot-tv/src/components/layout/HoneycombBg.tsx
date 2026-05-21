export function HoneycombBg() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background">
      <div 
        className="absolute inset-0 animate-honeycomb opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69.28203230275509' viewBox='0 0 40 69.28203230275509' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%2338bdf8' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpath d='M40 17.32l-20 11.547L0 17.32V0h40v17.32zM0 51.961l20-11.547 20 11.547v17.32H0v-17.32z'/%3E%3Cpath d='M20 46.188L0 34.641l20-11.547 20 11.547-20 11.547z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 138.56px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse-red" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-red" style={{ animationDuration: '12s', animationDelay: '2s' }} />
    </div>
  );
}
