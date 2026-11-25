declare const $: (selector: string) => {
  append: (html: string) => void
};

declare module "node:process" {
  const process: {
    env: Record<string, string | undefined>
  };
  export default process;
}
