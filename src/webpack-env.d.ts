// Supporto per Webpack Hot Module Replacement (HMR)
declare module NodeJS {
  interface Module {
    hot?: {
      accept(path?: string, callback?: () => void): void;
      accept(callback?: () => void): void;
    };
  }
}

// Dichiarazione per l'importazione di file JSON
declare module "*.json" {
  const value: any;
  export default value;
}

// Dichiarazione per l'importazione di file IMG
declare module "*.img" {
  const value: string;
  export default value;
}

// Dichiarazione per l'importazione di immagini e altri asset
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
