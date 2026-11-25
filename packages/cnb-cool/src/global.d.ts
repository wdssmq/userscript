declare module "node:process" {
  const process: {
    env: Record<string, string | undefined>
  };
  export default process;
}
