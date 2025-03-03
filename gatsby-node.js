const path = require('path');
const { exists, writeFile, ensureDir } = require('fs-extra');

const getMetaRedirect = require('./getMetaRedirect');

async function writeRedirectsFile(
  redirects,
  folder,
  pathPrefix,
  disableTrailingSlash
) {
  if (!redirects.length) return;

  for (const redirect of redirects) {
    const { fromPath, toPath } = redirect;

    const FILE_PATH = path.join(
      folder,
      fromPath.replace(pathPrefix, ''),
      'index.html'
    );

    const fileExists = await exists(FILE_PATH);
    if (!fileExists) {
      try {
        await ensureDir(path.dirname(FILE_PATH));
      } catch (err) {
        // ignore if the directory already exists;
      }

      const data = getMetaRedirect(toPath, disableTrailingSlash);
      await writeFile(FILE_PATH, data);
    }
  }
}

exports.onPostBuild = ({ store }, pluginOptions) => {
  const { redirects, program, config } = store.getState();

  let pathPrefix = '';
  if (program.prefixPaths) {
    pathPrefix = config.pathPrefix;
  }

  const folder = path.join(program.directory, 'public');
  return writeRedirectsFile(
    redirects,
    folder,
    pathPrefix,
    pluginOptions.disableTrailingSlash
  );
};

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    disableTrailingSlash: Joi.boolean()
      .default(false)
      .description(`disables adding a trailing slash.`)
  });
};
