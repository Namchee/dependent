export const command = '$0 <package> [files...]';
export const aliases = [];

// eslint-disable-next-line max-len
export const describe = 'Get all files in the current directory that depends on the specified package.';

export const builder = {
  module: {
    default: false,
  },
};

export const handler = (): void => { return; };
