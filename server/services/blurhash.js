const { encode } = require("blurhash");

module.exports = ({ strapi }) => ({
  async generateBlurhash(url) {
    try {
      const encodeImageToBlurhash = (buff) =>
        new Promise((resolve, reject) => {
          sharp(buff)
            .raw()
            .ensureAlpha()
            .resize(32, 32, { fit: "inside" })
            .toBuffer((err, buffer, { width, height }) => {
              if (err) return reject(err);
              resolve(
                encode(new Uint8ClampedArray(buffer), width, height, 4, 4)
              );
            });
        });

      const fetchModule = await import("node-fetch");
      const fetch = fetchModule.default;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const blurhash = await encodeImageToBlurhash(buffer);

      return blurhash;
    } catch (error) {
      strapi.log.error(`Error generating blurhash: ${error.message}`);
      throw error;
    }
  },
});
