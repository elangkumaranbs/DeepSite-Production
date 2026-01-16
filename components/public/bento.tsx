export const Bento = () => {
  return (
    <section id="features" className="min-h-screen py-20 px-6 relative">
      <header className="text-center mb-16">
        <div className="w-fit mb-2 text-[11px] mx-auto uppercase text-muted-foreground/70 font-semibold tracking-widest">
          Powerful Features 🚀
        </div>
        <h2 className="mb-3 text-balance text-3xl font-bold tracking-tight lg:text-5xl">
          Everything you need
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl md:text-lg lg:text-xl text-balance">
          Build, deploy, and scale your websites with cutting-edge features
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="max-md:col-span-1 max-lg:col-span-2 lg:row-span-2 relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl lg:text-4xl mb-4">📄</div>
            <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-3">
              Multi Pages
            </h3>
            <p className="text-muted-foreground lg:text-lg mb-6">
              Create complex websites with multiple interconnected pages. Build
              everything from simple landing pages to full-featured web
              applications with dynamic routing and navigation.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                Dynamic Routing
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                Navigation
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                SEO Ready
              </span>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-linear-to-r from-purple-500 to-pink-500 opacity-20 blur-3xl rounded-full transition-all duration-700 ease-out group-hover:scale-[4] group-hover:opacity-30" />
        </div>

        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3">
              Auto Deploy
            </h3>
            <p className="text-muted-foreground mb-4">
              Push your changes and watch them go live instantly. No complex
              CI/CD setup required.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-linear-to-r from-yellow-500 to-orange-500 opacity-20 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-[5] group-hover:opacity-35" />
        </div>

        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3">
              Free Hosting
            </h3>
            <p className="text-muted-foreground mb-4">
              Host your websites for free with global CDN and lightning-fast
              performance.
            </p>
          </div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-linear-to-r from-green-500 to-emerald-500 opacity-20 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-[5] group-hover:opacity-35" />
        </div>

        <div className="lg:col-span-2 relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4">🔓</div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3">
              Open Source Models
            </h3>
            <p className="text-muted-foreground mb-4">
              Powered by cutting-edge open source AI models. Transparent,
              customizable, and community-driven development.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                DeepSeek
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                MiniMax
              </span>
              <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                Kimi
              </span>
            </div>
          </div>
          <div className="absolute -bottom-10 right-10 w-32 h-32 bg-linear-to-r from-cyan-500 to-indigo-500 opacity-20 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-[5] group-hover:opacity-35" />
        </div>

        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3">
              Perfect UX
            </h3>
            <p className="text-muted-foreground mb-4">
              Intuitive interface designed for developers and non-developers
              alike.
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-r from-rose-500 to-pink-500 opacity-20 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-[5] group-hover:opacity-35" />
        </div>

        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4">🤗</div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3">
              Hugging Face
            </h3>
            <p className="text-muted-foreground mb-4">
              Seamless integration with Hugging Face models and datasets for
              cutting-edge AI capabilities.
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-r from-yellow-500 to-amber-500 opacity-20 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-[5] group-hover:opacity-35" />
        </div>

        <div className="relative p-8 rounded-2xl border border-border/80 shadow-2xs bg-linear-to-b from-background to-background/50 bg-card overflow-hidden group hover:border-border/20 transition-all duration-300">
          <div className="relative z-10">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-3">
              Blazing Fast
            </h3>
            <p className="text-muted-foreground mb-4">
              Optimized performance with edge computing and smart caching.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-linear-to-r from-blue-500 to-cyan-500 opacity-20 blur-2xl rounded-full transition-all duration-700 ease-out group-hover:scale-[5] group-hover:opacity-35" />
        </div>
      </div>
    </section>
  );
};
