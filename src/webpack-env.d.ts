// webpack-env.d.ts
declare module NodeJS {
    interface Module {
      hot?: {
        accept(callback?: () => void): void;
      };
    }
  }
  