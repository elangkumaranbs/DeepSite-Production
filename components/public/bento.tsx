"use client";

export const Bento = () => {
  return (
    <section id="features" className="min-h-screen py-20 px-6 relative">
      {/* Header with fade-in animation */}
      <header className="text-center mb-16 animate-in fade-in duration-700">
        <div className="w-fit mb-2 text-[11px] mx-auto uppercase text-muted-foreground/70 font-semibold tracking-widest animate-in fade-in slide-in-from-top-2 duration-500">
          Powerful Features 🚀
        </div>
        <h2 className="mb-3 text-balance text-3xl font-bold tracking-tight lg:text-5xl animate-in fade-in slide-in-from-top-3 duration-700 delay-100">
          Everything you need
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl md:text-lg lg:text-xl text-balance animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
          Build, deploy, and scale your websites with cutting-edge features
        </p>
      </header>

      {/* Grid with staggered card animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Multi Pages - Large Card */}
        <div className="max-md:col-span-1 max-lg:col-span-2 lg:row-span-2 relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-100">
          <div className="relative z-10">
            <div className="text-3xl lg:text-4xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              📄
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-3 transition-colors duration-300">
              Multi Pages
            </h3>
            <p className="text-muted-foreground lg:text-lg mb-6 transition-colors duration-300 group-hover:text-foreground/90">
              Create complex websites with multiple interconnected pages. Build
              everything from simple landing pages to full-featured web
              applications with dynamic routing and navigation.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded-md text-xs font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-purple-500/40 hover:border-purple-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                Dynamic Routing
              </span>
              <span className="px-3 py-1.5 bg-blue-500/30 text-blue-200 border border-blue-400/40 rounded-md text-xs font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-blue-500/40 hover:border-blue-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                Navigation
              </span>
              <span className="px-3 py-1.5 bg-green-500/30 text-green-200 border border-green-400/40 rounded-md text-xs font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-green-500/40 hover:border-green-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                SEO Ready
              </span>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-linear-to-r from-purple-500 to-pink-500 opacity-10 blur-3xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>

        {/* Auto Deploy */}
        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-200">
          <div className="relative z-10">
            <div className="text-3xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              ⚡
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3 transition-colors duration-300">
              Auto Deploy
            </h3>
            <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/90">
              Push your changes and watch them go live instantly. No complex
              CI/CD setup required.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-linear-to-r from-yellow-500 to-orange-500 opacity-10 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>

        {/* Free Hosting */}
        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              🌐
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3 transition-colors duration-300">
              Free Hosting
            </h3>
            <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/90">
              Host your websites for free with global CDN and lightning-fast
              performance.
            </p>
          </div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-linear-to-r from-green-500 to-emerald-500 opacity-10 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>

        {/* Open Source Models */}
        <div className="lg:col-span-2 relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-400">
          <div className="relative z-10">
            <div className="text-3xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
              🔓
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3 transition-colors duration-300">
              Open Source Models
            </h3>
            <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/90">
              Powered by cutting-edge open source AI models. Transparent,
              customizable, and community-driven development.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 rounded-md text-xs font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-cyan-500/40 hover:border-cyan-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                DeepSeek
              </span>
              <span className="px-3 py-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-md text-xs font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-indigo-500/40 hover:border-indigo-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                MiniMax
              </span>
              <span className="px-3 py-1.5 bg-pink-500/30 text-pink-200 border border-pink-400/40 rounded-md text-xs font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-pink-500/40 hover:border-pink-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                Kimi
              </span>
            </div>
          </div>
          <div className="absolute -bottom-10 right-10 w-32 h-32 bg-linear-to-r from-cyan-500 to-indigo-500 opacity-10 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>

        {/* Perfect UX */}
        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-500">
          <div className="relative z-10">
            <div className="text-3xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              ✨
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3 transition-colors duration-300">
              Perfect UX
            </h3>
            <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/90">
              Intuitive interface designed for developers and non-developers
              alike.
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-r from-rose-500 to-pink-500 opacity-10 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>

        {/* Hugging Face */}
        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-[600ms]">
          <div className="relative z-10">
            <div className="text-3xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              🤗
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3 transition-colors duration-300">
              Hugging Face
            </h3>
            <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/90">
              Seamless integration with Hugging Face models and datasets for
              cutting-edge AI capabilities.
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-r from-yellow-500 to-amber-500 opacity-10 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>

        {/* Blazing Fast */}
        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-700">
          <div className="relative z-10">
            <div className="text-3xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
              🚀
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3 transition-colors duration-300">
              Blazing Fast
            </h3>
            <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/90">
              Optimized performance with edge computing and smart caching.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-linear-to-r from-blue-500 to-cyan-500 opacity-10 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-20" />
        </div>
      </div>
    </section>
  );
};
