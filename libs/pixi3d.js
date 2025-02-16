/* Pixi3D v2.5.0 */
var PIXI3D = (function (exports, PixiCore, loaders, assets, settings, math, display, constants, utils, ticker, sprite) {
  'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var PixiCore__namespace = /*#__PURE__*/_interopNamespace(PixiCore);

  var CompatibilityAccess;
  ((CompatibilityAccess2) => {
    function get(obj, key) {
      return obj[key];
    }
    CompatibilityAccess2.get = get;
  })(CompatibilityAccess || (CompatibilityAccess = {}));

  var LoaderResourceResponseType = /* @__PURE__ */ ((LoaderResourceResponseType2) => {
    LoaderResourceResponseType2[LoaderResourceResponseType2["buffer"] = 0] = "buffer";
    LoaderResourceResponseType2[LoaderResourceResponseType2["json"] = 1] = "json";
    LoaderResourceResponseType2[LoaderResourceResponseType2["text"] = 2] = "text";
    return LoaderResourceResponseType2;
  })(LoaderResourceResponseType || {});

  class Version530 {
    setLoaderResourceExtensionType(extension, type) {
      let responseType = loaders.LoaderResource.XHR_RESPONSE_TYPE.TEXT;
      if (type === LoaderResourceResponseType.buffer) {
        responseType = loaders.LoaderResource.XHR_RESPONSE_TYPE.BUFFER;
      } else if (type === LoaderResourceResponseType.json) {
        responseType = loaders.LoaderResource.XHR_RESPONSE_TYPE.JSON;
      }
      loaders.LoaderResource.setExtensionXhrType(extension, responseType);
    }
    getInteractionPlugin(renderer) {
      return renderer.plugins.interaction;
    }
    get assets() {
      return void 0;
    }
    isRendererDestroyed(renderer) {
      return !renderer.gl;
    }
    installRendererPlugin(name, plugin) {
      PixiCore.Renderer.registerPlugin(name, plugin);
    }
    installLoaderPlugin(name, plugin) {
      loaders.Loader.registerPlugin(plugin);
    }
    render(renderer, object, renderTexture) {
      renderer.render(object, renderTexture);
    }
  }

  class Version600 extends Version530 {
    render(renderer, object, renderTexture) {
      renderer.render(object, { renderTexture });
    }
  }

  class Version650 extends Version600 {
    installRendererPlugin(name, plugin) {
      plugin.extension = {
        type: CompatibilityAccess.get(PixiCore__namespace, "ExtensionType").RendererPlugin,
        name
      };
      CompatibilityAccess.get(PixiCore__namespace, "extensions").add(plugin);
    }
    installLoaderPlugin(name, plugin) {
      plugin.extension = {
        type: CompatibilityAccess.get(PixiCore__namespace, "ExtensionType").Loader,
        name
      };
      CompatibilityAccess.get(PixiCore__namespace, "extensions").add(plugin);
    }
  }

  class Version700 extends Version650 {
    setLoaderResourceExtensionType(extension, type) {
    }
    getInteractionPlugin(renderer) {
      return void 0;
    }
    get assets() {
      return assets.Assets;
    }
    isRendererDestroyed(renderer) {
      if ("_systemsHash" in renderer) {
        return Object.keys(renderer._systemsHash).length === 0;
      }
      return false;
    }
    installRendererPlugin(name, plugin) {
      plugin.extension = {
        type: [CompatibilityAccess.get(PixiCore__namespace, "ExtensionType").RendererPlugin],
        name
      };
      CompatibilityAccess.get(PixiCore__namespace, "extensions").add(plugin);
    }
    installLoaderPlugin(name, plugin) {
      plugin.extension = {
        type: [
          CompatibilityAccess.get(PixiCore__namespace, "ExtensionType").Loader,
          CompatibilityAccess.get(PixiCore__namespace, "ExtensionType").LoadParser
        ],
        name
      };
      CompatibilityAccess.get(PixiCore__namespace, "extensions").add(plugin);
    }
  }

  const isPixi700 = "VERSION" in PixiCore__namespace && CompatibilityAccess.get(PixiCore__namespace, "VERSION").startsWith("7");
  const isPixi650 = "extensions" in PixiCore__namespace;
  const isPixi600 = "ArrayResource" in PixiCore__namespace;
  const Compatibility = isPixi700 ? new Version700() : isPixi650 ? new Version650() : isPixi600 ? new Version600() : new Version530();

  class glTFAsset {
    constructor(descriptor, buffers = [], images = []) {
      this.descriptor = descriptor;
      this.buffers = buffers;
      this.images = images;
      this.textures = [];
    }
    static load(descriptor, loader, cb) {
      let asset = new glTFAsset(descriptor);
      loadBuffers(descriptor, (buffers) => {
        buffers.forEach((buffer) => asset.buffers.push(buffer));
        loadImages(descriptor, buffers, (images) => {
          images.forEach((image) => asset.images.push(image));
          cb && cb(asset);
        }, loader);
      }, loader);
      return asset;
    }
    static isValidBuffer(buffer) {
      const header = new Uint32Array(buffer, 0, 3);
      if (header[0] === 1179937895 && header[1] === 2) {
        return true;
      }
      return false;
    }
    static isEmbeddedResource(uri) {
      return uri && uri.startsWith("data:");
    }
    static fromBuffer(data, cb) {
      const chunks = [];
      let offset = 3 * 4;
      while (offset < data.byteLength) {
        const header = new Uint32Array(data, offset, 3);
        chunks.push({
          length: header[0],
          type: header[1],
          offset: offset + 2 * 4
        });
        offset += header[0] + 2 * 4;
      }
      const json = new Uint8Array(data, chunks[0].offset, chunks[0].length);
      const descriptor = JSON.parse(new TextDecoder("utf-8").decode(json));
      const buffers = [];
      for (let i = 1; i < chunks.length; i++) {
        buffers.push(data.slice(chunks[i].offset, chunks[i].offset + chunks[i].length));
      }
      loadImages(descriptor, buffers, (images) => {
        cb(new glTFAsset(descriptor, buffers, images));
      });
    }
    static async fromURL(url, options) {
      if (!Compatibility.assets) {
        throw new Error("PIXI3D: This feature is only available when using PixiJS v7+");
      }
      const response = await settings.settings.ADAPTER.fetch(url, options);
      return new Promise(async (resolve) => {
        if (url.includes(".glb")) {
          let buffer = await response.arrayBuffer();
          glTFAsset.fromBuffer(buffer, (gltf) => {
            resolve(gltf);
          });
        } else {
          let descriptor = await response.json();
          glTFAsset.load(descriptor, new ResourceLoader(url), (gltf) => {
            resolve(gltf);
          });
        }
      });
    }
  }
  class ResourceLoader {
    constructor(parentURL) {
      this.parentURL = parentURL;
    }
    load(uri, onComplete) {
      const url = this.parentURL.substring(
        0,
        this.parentURL.lastIndexOf("/") + 1
      ) + uri;
      const loadAsync = async () => {
        if (!Compatibility.assets) {
          throw new Error("PIXI3D: Assets are not available in current version of PixiJS.");
        }
        let resource = {};
        if (url.includes(".bin")) {
          const response = await settings.settings.ADAPTER.fetch(url);
          resource.data = await response.arrayBuffer();
        } else {
          let texture = await Compatibility.assets.load(url);
          if (texture) {
            resource.texture = texture;
          }
        }
        onComplete(resource);
      };
      loadAsync();
    }
  }
  function loadImages(descriptor, buffers, cb, loader) {
    const images = [];
    if (!descriptor.images || descriptor.images.length === 0) {
      return cb(images);
    }
    let embeddedImages = descriptor.images.filter((img) => typeof img.bufferView !== "number" && glTFAsset.isEmbeddedResource(img.uri)).map((img, index) => index);
    let externalImages = descriptor.images.filter((img) => typeof img.bufferView !== "number" && !glTFAsset.isEmbeddedResource(img.uri)).map((img, index) => index);
    let bufferImages = descriptor.images.filter((img) => typeof img.bufferView === "number").map((img, index) => index);
    for (let i = 0; i < embeddedImages.length; i++) {
      let index = embeddedImages[i];
      let image = descriptor.images[index];
      images[index] = PixiCore.Texture.from(image.uri);
    }
    if (bufferImages.length === 0 && externalImages.length === 0) {
      return cb(images);
    }
    if (externalImages.length > 0 && !loader) {
      throw new Error("PIXI3D: A resource loader is required when image is external.");
    }
    const loadExternalImage = (image, index, cb2) => {
      loader == null ? void 0 : loader.load(image.uri, (resource) => {
        if (resource.texture) {
          images[index] = resource.texture;
          cb2();
        }
      });
    };
    const loadBufferImage = (image, index, cb2) => {
      loadImageFromBuffer(image, descriptor, buffers, (image2) => {
        images[index] = image2;
        cb2();
      });
    };
    let externalImagesCount = externalImages.length;
    let bufferImagesCount = bufferImages.length;
    for (let i = 0; i < externalImages.length; i++) {
      let index = externalImages[i];
      let image = descriptor.images[index];
      loadExternalImage(image, index, () => {
        if (--externalImagesCount === 0 && bufferImagesCount === 0) {
          cb(images);
        }
      });
    }
    for (let i = 0; i < bufferImages.length; i++) {
      let index = bufferImages[i];
      let image = descriptor.images[index];
      loadBufferImage(image, index, () => {
        if (--bufferImagesCount === 0 && externalImagesCount === 0) {
          cb(images);
        }
      });
    }
  }
  function loadBuffers(descriptor, cb, loader) {
    const buffers = [];
    const embeddedBuffers = descriptor.buffers.filter((buffer) => glTFAsset.isEmbeddedResource(buffer.uri)).map((buffer, index) => index);
    for (let i = 0; i < embeddedBuffers.length; i++) {
      let index = embeddedBuffers[i];
      let buffer = descriptor.buffers[index];
      buffers[index] = createBufferFromBase64(buffer.uri);
    }
    const externalBuffers = descriptor.buffers.filter((buffer) => !glTFAsset.isEmbeddedResource(buffer.uri)).map((buffer, index) => index);
    if (externalBuffers.length === 0) {
      return cb(buffers);
    }
    if (!loader) {
      throw new Error("PIXI3D: A resource loader is required when buffer is not embedded.");
    }
    const loadExternalBuffer = (uri, index, cb2) => {
      loader.load(uri, (resource) => {
        buffers[index] = resource.data;
        cb2();
      });
    };
    let externalBuffersCount = externalBuffers.length;
    for (let i = 0; i < externalBuffers.length; i++) {
      let index = externalBuffers[i];
      let buffer = descriptor.buffers[index];
      loadExternalBuffer(buffer.uri, index, () => {
        if (--externalBuffersCount === 0) {
          cb(buffers);
        }
      });
    }
  }
  function loadImageFromBuffer(image, descriptor, buffers, cb) {
    const view = descriptor.bufferViews[image.bufferView];
    const array = new Uint8Array(buffers[view.buffer], view.byteOffset, view.byteLength);
    const blob = new Blob([array], { "type": image.mimeType });
    const reader = new FileReader();
    reader.onload = () => {
      cb(PixiCore.Texture.from(reader.result));
    };
    reader.readAsDataURL(blob);
  }
  function createBufferFromBase64(value) {
    return Uint8Array.from(atob(value.split(",")[1]), (c) => c.charCodeAt(0)).buffer;
  }

  const glTFLoader = {
    use: function(resource, next) {
      if (resource.extension !== "gltf") {
        return next();
      }
      let loader = this;
      glTFAsset.load(resource.data, new glTFExternalResourceLoader(loader, resource), (gltf) => {
        Object.assign(resource, { gltf });
        next();
      });
    },
    add: function() {
      Compatibility.setLoaderResourceExtensionType(
        "bin",
        LoaderResourceResponseType.buffer
      );
      Compatibility.setLoaderResourceExtensionType(
        "gltf",
        LoaderResourceResponseType.json
      );
    },
    test(url) {
      return url.includes(".gltf") || url.includes(".glb");
    },
    async load(url) {
      return await glTFAsset.fromURL(url);
    }
  };
  Compatibility.installLoaderPlugin("gltf", glTFLoader);
  class glTFExternalResourceLoader {
    constructor(_loader, _resource) {
      this._loader = _loader;
      this._resource = _resource;
    }
    load(uri, onComplete) {
      const url = this._resource.url.substring(
        0,
        this._resource.url.lastIndexOf("/") + 1
      ) + uri;
      if (!this._loader.resources[url]) {
        this._loader.add({ parentResource: this._resource, url, onComplete });
      } else if (this._loader.resources[url].data) {
        onComplete(this._loader.resources[url]);
      } else {
        let binding = this._loader.onProgress.add((_, resource) => {
          if (resource.url === url) {
            onComplete(resource);
            binding.detach();
          }
        });
      }
    }
  }

  const glTFBinaryLoader = {
    use: function(resource, next) {
      if (resource.extension !== "glb") {
        return next();
      }
      if (glTFAsset.isValidBuffer(resource.data)) {
        glTFAsset.fromBuffer(resource.data, (gltf) => {
          Object.assign(resource, { gltf });
          next();
        });
      } else {
        return next();
      }
    },
    add: function() {
      Compatibility.setLoaderResourceExtensionType(
        "glb",
        LoaderResourceResponseType.buffer
      );
    }
  };
  Compatibility.installLoaderPlugin("cubemap", glTFBinaryLoader);

  /**
   * Common utilities
   * @module glMatrix
   */
  // Configuration Constants
  var EPSILON$1 = 0.000001;
  var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
  if (!Math.hypot) Math.hypot = function () {
    var y = 0,
        i = arguments.length;

    while (i--) {
      y += arguments[i] * arguments[i];
    }

    return Math.sqrt(y);
  };

  /**
   * 3x3 Matrix
   * @module mat3
   */

  /**
   * Creates a new identity mat3
   *
   * @returns {mat3} a new 3x3 matrix
   */

  function create$4() {
    var out = new ARRAY_TYPE(9);

    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
    }

    out[0] = 1;
    out[4] = 1;
    out[8] = 1;
    return out;
  }
  /**
   * Multiplies two mat3's
   *
   * @param {mat3} out the receiving matrix
   * @param {ReadonlyMat3} a the first operand
   * @param {ReadonlyMat3} b the second operand
   * @returns {mat3} out
   */

  function multiply$2(out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    var a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    var a20 = a[6],
        a21 = a[7],
        a22 = a[8];
    var b00 = b[0],
        b01 = b[1],
        b02 = b[2];
    var b10 = b[3],
        b11 = b[4],
        b12 = b[5];
    var b20 = b[6],
        b21 = b[7],
        b22 = b[8];
    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
  }

  /**
   * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
   * @module mat4
   */

  /**
   * Creates a new identity mat4
   *
   * @returns {mat4} a new 4x4 matrix
   */

  function create$3() {
    var out = new ARRAY_TYPE(16);

    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
    }

    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  /**
   * Copy the values from one mat4 to another
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the source matrix
   * @returns {mat4} out
   */

  function copy$1(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  /**
   * Set a mat4 to the identity matrix
   *
   * @param {mat4} out the receiving matrix
   * @returns {mat4} out
   */

  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Transpose the values of a mat4
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the source matrix
   * @returns {mat4} out
   */

  function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
      var a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a12 = a[6],
          a13 = a[7];
      var a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }

    return out;
  }
  /**
   * Inverts a mat4
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the source matrix
   * @returns {mat4} out
   */

  function invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  /**
   * Multiplies two mat4s
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the first operand
   * @param {ReadonlyMat4} b the second operand
   * @returns {mat4} out
   */

  function multiply$1(out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15]; // Cache only the current line of the second matrix

    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }
  /**
   * Translate a mat4 by the given vector
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to translate
   * @param {ReadonlyVec3} v vector to translate by
   * @returns {mat4} out
   */

  function translate(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }
  /**
   * Scales the mat4 by the dimensions in the given vec3 not using vectorization
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to scale
   * @param {ReadonlyVec3} v the vec3 to scale the matrix by
   * @returns {mat4} out
   **/

  function scale$1(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  /**
   * Rotates a mat4 by the given angle around the given axis
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @param {ReadonlyVec3} axis the axis to rotate around
   * @returns {mat4} out
   */

  function rotate(out, a, rad, axis) {
    var x = axis[0],
        y = axis[1],
        z = axis[2];
    var len = Math.hypot(x, y, z);
    var s, c, t;
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var b00, b01, b02;
    var b10, b11, b12;
    var b20, b21, b22;

    if (len < EPSILON$1) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11]; // Construct the elements of the rotation matrix

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

    return out;
  }
  /**
   * Rotates a matrix by the given angle around the X axis
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @returns {mat4} out
   */

  function rotateX$1(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];

    if (a !== out) {
      // If the source and destination differ, copy the unchanged rows
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    } // Perform axis-specific matrix multiplication


    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
  }
  /**
   * Rotates a matrix by the given angle around the Y axis
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @returns {mat4} out
   */

  function rotateY$1(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];

    if (a !== out) {
      // If the source and destination differ, copy the unchanged rows
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    } // Perform axis-specific matrix multiplication


    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
  }
  /**
   * Rotates a matrix by the given angle around the Z axis
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @returns {mat4} out
   */

  function rotateZ$1(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    } // Perform axis-specific matrix multiplication


    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
  }
  /**
   * Creates a matrix from a vector translation
   * This is equivalent to (but much faster than):
   *
   *     mat4.identity(dest);
   *     mat4.translate(dest, dest, vec);
   *
   * @param {mat4} out mat4 receiving operation result
   * @param {ReadonlyVec3} v Translation vector
   * @returns {mat4} out
   */

  function fromTranslation(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  /**
   * Creates a matrix from a vector scaling
   * This is equivalent to (but much faster than):
   *
   *     mat4.identity(dest);
   *     mat4.scale(dest, dest, vec);
   *
   * @param {mat4} out mat4 receiving operation result
   * @param {ReadonlyVec3} v Scaling vector
   * @returns {mat4} out
   */

  function fromScaling(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = v[1];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = v[2];
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Creates a matrix from a given angle around a given axis
   * This is equivalent to (but much faster than):
   *
   *     mat4.identity(dest);
   *     mat4.rotate(dest, dest, rad, axis);
   *
   * @param {mat4} out mat4 receiving operation result
   * @param {Number} rad the angle to rotate the matrix by
   * @param {ReadonlyVec3} axis the axis to rotate around
   * @returns {mat4} out
   */

  function fromRotation(out, rad, axis) {
    var x = axis[0],
        y = axis[1],
        z = axis[2];
    var len = Math.hypot(x, y, z);
    var s, c, t;

    if (len < EPSILON$1) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c; // Perform rotation-specific matrix multiplication

    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Returns the translation vector component of a transformation
   *  matrix. If a matrix is built with fromRotationTranslation,
   *  the returned vector will be the same as the translation vector
   *  originally supplied.
   * @param  {vec3} out Vector to receive translation component
   * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
   * @return {vec3} out
   */

  function getTranslation(out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];
    return out;
  }
  /**
   * Returns the scaling factor component of a transformation
   *  matrix. If a matrix is built with fromRotationTranslationScale
   *  with a normalized Quaternion paramter, the returned vector will be
   *  the same as the scaling vector
   *  originally supplied.
   * @param  {vec3} out Vector to receive scaling factor component
   * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
   * @return {vec3} out
   */

  function getScaling(out, mat) {
    var m11 = mat[0];
    var m12 = mat[1];
    var m13 = mat[2];
    var m21 = mat[4];
    var m22 = mat[5];
    var m23 = mat[6];
    var m31 = mat[8];
    var m32 = mat[9];
    var m33 = mat[10];
    out[0] = Math.hypot(m11, m12, m13);
    out[1] = Math.hypot(m21, m22, m23);
    out[2] = Math.hypot(m31, m32, m33);
    return out;
  }
  /**
   * Returns a quaternion representing the rotational component
   *  of a transformation matrix. If a matrix is built with
   *  fromRotationTranslation, the returned quaternion will be the
   *  same as the quaternion originally supplied.
   * @param {quat} out Quaternion to receive the rotation component
   * @param {ReadonlyMat4} mat Matrix to be decomposed (input)
   * @return {quat} out
   */

  function getRotation(out, mat) {
    var scaling = new ARRAY_TYPE(3);
    getScaling(scaling, mat);
    var is1 = 1 / scaling[0];
    var is2 = 1 / scaling[1];
    var is3 = 1 / scaling[2];
    var sm11 = mat[0] * is1;
    var sm12 = mat[1] * is2;
    var sm13 = mat[2] * is3;
    var sm21 = mat[4] * is1;
    var sm22 = mat[5] * is2;
    var sm23 = mat[6] * is3;
    var sm31 = mat[8] * is1;
    var sm32 = mat[9] * is2;
    var sm33 = mat[10] * is3;
    var trace = sm11 + sm22 + sm33;
    var S = 0;

    if (trace > 0) {
      S = Math.sqrt(trace + 1.0) * 2;
      out[3] = 0.25 * S;
      out[0] = (sm23 - sm32) / S;
      out[1] = (sm31 - sm13) / S;
      out[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
      out[3] = (sm23 - sm32) / S;
      out[0] = 0.25 * S;
      out[1] = (sm12 + sm21) / S;
      out[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
      out[3] = (sm31 - sm13) / S;
      out[0] = (sm12 + sm21) / S;
      out[1] = 0.25 * S;
      out[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
      out[3] = (sm12 - sm21) / S;
      out[0] = (sm31 + sm13) / S;
      out[1] = (sm23 + sm32) / S;
      out[2] = 0.25 * S;
    }

    return out;
  }
  /**
   * Creates a matrix from a quaternion rotation, vector translation and vector scale
   * This is equivalent to (but much faster than):
   *
   *     mat4.identity(dest);
   *     mat4.translate(dest, vec);
   *     let quatMat = mat4.create();
   *     quat4.toMat4(quat, quatMat);
   *     mat4.multiply(dest, quatMat);
   *     mat4.scale(dest, scale)
   *
   * @param {mat4} out mat4 receiving operation result
   * @param {quat4} q Rotation quaternion
   * @param {ReadonlyVec3} v Translation vector
   * @param {ReadonlyVec3} s Scaling vector
   * @returns {mat4} out
   */

  function fromRotationTranslationScale(out, q, v, s) {
    // Quaternion math
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var sx = s[0];
    var sy = s[1];
    var sz = s[2];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  /**
   * Calculates a 4x4 matrix from the given quaternion
   *
   * @param {mat4} out mat4 receiving operation result
   * @param {ReadonlyQuat} q Quaternion to create matrix from
   *
   * @returns {mat4} out
   */

  function fromQuat(out, q) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var yx = y * x2;
    var yy = y * y2;
    var zx = z * x2;
    var zy = z * y2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;
    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;
    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Generates a perspective projection matrix with the given bounds.
   * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
   * which matches WebGL/OpenGL's clip volume.
   * Passing null/undefined/no value for far will generate infinite projection matrix.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {number} fovy Vertical field of view in radians
   * @param {number} aspect Aspect ratio. typically viewport width/height
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum, can be null or Infinity
   * @returns {mat4} out
   */

  function perspectiveNO(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }
  /**
   * Alias for {@link mat4.perspectiveNO}
   * @function
   */

  var perspective = perspectiveNO;
  /**
   * Generates a orthogonal projection matrix with the given bounds.
   * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
   * which matches WebGL/OpenGL's clip volume.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {number} left Left bound of the frustum
   * @param {number} right Right bound of the frustum
   * @param {number} bottom Bottom bound of the frustum
   * @param {number} top Top bound of the frustum
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum
   * @returns {mat4} out
   */

  function orthoNO(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top);
    var nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  }
  /**
   * Alias for {@link mat4.orthoNO}
   * @function
   */

  var ortho = orthoNO;
  /**
   * Generates a look-at matrix with the given eye position, focal point, and up axis.
   * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {ReadonlyVec3} eye Position of the viewer
   * @param {ReadonlyVec3} center Point the viewer is looking at
   * @param {ReadonlyVec3} up vec3 pointing up
   * @returns {mat4} out
   */

  function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    var eyex = eye[0];
    var eyey = eye[1];
    var eyez = eye[2];
    var upx = up[0];
    var upy = up[1];
    var upz = up[2];
    var centerx = center[0];
    var centery = center[1];
    var centerz = center[2];

    if (Math.abs(eyex - centerx) < EPSILON$1 && Math.abs(eyey - centery) < EPSILON$1 && Math.abs(eyez - centerz) < EPSILON$1) {
      return identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len = 1 / Math.hypot(z0, z1, z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.hypot(x0, x1, x2);

    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.hypot(y0, y1, y2);

    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  }
  /**
   * Generates a matrix that makes something look at something else.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {ReadonlyVec3} eye Position of the viewer
   * @param {ReadonlyVec3} center Point the viewer is looking at
   * @param {ReadonlyVec3} up vec3 pointing up
   * @returns {mat4} out
   */

  function targetTo(out, eye, target, up) {
    var eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2];
    var z0 = eyex - target[0],
        z1 = eyey - target[1],
        z2 = eyez - target[2];
    var len = z0 * z0 + z1 * z1 + z2 * z2;

    if (len > 0) {
      len = 1 / Math.sqrt(len);
      z0 *= len;
      z1 *= len;
      z2 *= len;
    }

    var x0 = upy * z2 - upz * z1,
        x1 = upz * z0 - upx * z2,
        x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2;

    if (len > 0) {
      len = 1 / Math.sqrt(len);
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
  }

  /**
   * 3 Dimensional Vector
   * @module vec3
   */

  /**
   * Creates a new, empty vec3
   *
   * @returns {vec3} a new 3D vector
   */

  function create$2() {
    var out = new ARRAY_TYPE(3);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

    return out;
  }
  /**
   * Calculates the length of a vec3
   *
   * @param {ReadonlyVec3} a vector to calculate length of
   * @returns {Number} length of a
   */

  function length(a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return Math.hypot(x, y, z);
  }
  /**
   * Creates a new vec3 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @returns {vec3} a new 3D vector
   */

  function fromValues$2(x, y, z) {
    var out = new ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  /**
   * Copy the values from one vec3 to another
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the source vector
   * @returns {vec3} out
   */

  function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  /**
   * Set the components of a vec3 to the given values
   *
   * @param {vec3} out the receiving vector
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @returns {vec3} out
   */

  function set$2(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  /**
   * Adds two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  /**
   * Subtracts vector b from vector a
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }
  /**
   * Multiplies two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
  }
  /**
   * Scales a vec3 by a scalar number
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the vector to scale
   * @param {Number} b amount to scale the vector by
   * @returns {vec3} out
   */

  function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
  }
  /**
   * Calculates the euclidian distance between two vec3's
   *
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {Number} distance between a and b
   */

  function distance(a, b) {
    var x = b[0] - a[0];
    var y = b[1] - a[1];
    var z = b[2] - a[2];
    return Math.hypot(x, y, z);
  }
  /**
   * Calculates the squared euclidian distance between two vec3's
   *
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {Number} squared distance between a and b
   */

  function squaredDistance(a, b) {
    var x = b[0] - a[0];
    var y = b[1] - a[1];
    var z = b[2] - a[2];
    return x * x + y * y + z * z;
  }
  /**
   * Calculates the squared length of a vec3
   *
   * @param {ReadonlyVec3} a vector to calculate squared length of
   * @returns {Number} squared length of a
   */

  function squaredLength(a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return x * x + y * y + z * z;
  }
  /**
   * Negates the components of a vec3
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a vector to negate
   * @returns {vec3} out
   */

  function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
  }
  /**
   * Returns the inverse of the components of a vec3
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a vector to invert
   * @returns {vec3} out
   */

  function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
  }
  /**
   * Normalize a vec3
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a vector to normalize
   * @returns {vec3} out
   */

  function normalize$2(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var len = x * x + y * y + z * z;

    if (len > 0) {
      //TODO: evaluate use of glm_invsqrt here?
      len = 1 / Math.sqrt(len);
    }

    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
  }
  /**
   * Calculates the dot product of two vec3's
   *
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {Number} dot product of a and b
   */

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  /**
   * Computes the cross product of two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function cross(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    var bx = b[0],
        by = b[1],
        bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }
  /**
   * Performs a linear interpolation between two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {vec3} out
   */

  function lerp(out, a, b, t) {
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
  }
  /**
   * Transforms the vec3 with a mat4.
   * 4th vector component is implicitly '1'
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the vector to transform
   * @param {ReadonlyMat4} m matrix to transform with
   * @returns {vec3} out
   */

  function transformMat4$1(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }
  /**
   * Transforms the vec3 with a quat
   * Can also be used for dual quaternions. (Multiply it with the real part)
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the vector to transform
   * @param {ReadonlyQuat} q quaternion to transform with
   * @returns {vec3} out
   */

  function transformQuat(out, a, q) {
    // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
    var qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3];
    var x = a[0],
        y = a[1],
        z = a[2]; // var qvec = [qx, qy, qz];
    // var uv = vec3.cross([], qvec, a);

    var uvx = qy * z - qz * y,
        uvy = qz * x - qx * z,
        uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);

    var uuvx = qy * uvz - qz * uvy,
        uuvy = qz * uvx - qx * uvz,
        uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);

    var w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2; // vec3.scale(uuv, uuv, 2);

    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));

    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
  }
  /**
   * Alias for {@link vec3.length}
   * @function
   */

  var len = length;
  /**
   * Perform some operation over an array of vec3s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */

  (function () {
    var vec = create$2();
    return function (a, stride, offset, count, fn, arg) {
      var i, l;

      if (!stride) {
        stride = 3;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }

      return a;
    };
  })();

  /**
   * 4 Dimensional Vector
   * @module vec4
   */

  /**
   * Creates a new, empty vec4
   *
   * @returns {vec4} a new 4D vector
   */

  function create$1() {
    var out = new ARRAY_TYPE(4);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
    }

    return out;
  }
  /**
   * Creates a new vec4 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @param {Number} w W component
   * @returns {vec4} a new 4D vector
   */

  function fromValues$1(x, y, z, w) {
    var out = new ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }
  /**
   * Set the components of a vec4 to the given values
   *
   * @param {vec4} out the receiving vector
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @param {Number} w W component
   * @returns {vec4} out
   */

  function set$1(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }
  /**
   * Normalize a vec4
   *
   * @param {vec4} out the receiving vector
   * @param {ReadonlyVec4} a vector to normalize
   * @returns {vec4} out
   */

  function normalize$1(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var w = a[3];
    var len = x * x + y * y + z * z + w * w;

    if (len > 0) {
      len = 1 / Math.sqrt(len);
    }

    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
    return out;
  }
  /**
   * Transforms the vec4 with a mat4.
   *
   * @param {vec4} out the receiving vector
   * @param {ReadonlyVec4} a the vector to transform
   * @param {ReadonlyMat4} m matrix to transform with
   * @returns {vec4} out
   */

  function transformMat4(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
  }
  /**
   * Perform some operation over an array of vec4s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */

  (function () {
    var vec = create$1();
    return function (a, stride, offset, count, fn, arg) {
      var i, l;

      if (!stride) {
        stride = 4;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        vec[3] = a[i + 3];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
        a[i + 3] = vec[3];
      }

      return a;
    };
  })();

  /**
   * Quaternion
   * @module quat
   */

  /**
   * Creates a new identity quat
   *
   * @returns {quat} a new quaternion
   */

  function create() {
    var out = new ARRAY_TYPE(4);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

    out[3] = 1;
    return out;
  }
  /**
   * Sets a quat from the given angle and rotation axis,
   * then returns it.
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyVec3} axis the axis around which to rotate
   * @param {Number} rad the angle in radians
   * @returns {quat} out
   **/

  function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  }
  /**
   * Rotates a quaternion by the given angle about the X axis
   *
   * @param {quat} out quat receiving operation result
   * @param {ReadonlyQuat} a quat to rotate
   * @param {number} rad angle (in radians) to rotate
   * @returns {quat} out
   */

  function rotateX(out, a, rad) {
    rad *= 0.5;
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var bx = Math.sin(rad),
        bw = Math.cos(rad);
    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
  }
  /**
   * Rotates a quaternion by the given angle about the Y axis
   *
   * @param {quat} out quat receiving operation result
   * @param {ReadonlyQuat} a quat to rotate
   * @param {number} rad angle (in radians) to rotate
   * @returns {quat} out
   */

  function rotateY(out, a, rad) {
    rad *= 0.5;
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var by = Math.sin(rad),
        bw = Math.cos(rad);
    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
  }
  /**
   * Rotates a quaternion by the given angle about the Z axis
   *
   * @param {quat} out quat receiving operation result
   * @param {ReadonlyQuat} a quat to rotate
   * @param {number} rad angle (in radians) to rotate
   * @returns {quat} out
   */

  function rotateZ(out, a, rad) {
    rad *= 0.5;
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var bz = Math.sin(rad),
        bw = Math.cos(rad);
    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
  }
  /**
   * Performs a spherical linear interpolation between two quat
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a the first operand
   * @param {ReadonlyQuat} b the second operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {quat} out
   */

  function slerp(out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];
    var omega, cosom, sinom, scale0, scale1; // calc cosine

    cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    } // calculate coefficients


    if (1.0 - cosom > EPSILON$1) {
      // standard case (slerp)
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    } // calculate final values


    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    return out;
  }
  /**
   * Calculates the conjugate of a quat
   * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a quat to calculate conjugate of
   * @returns {quat} out
   */

  function conjugate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
  }
  /**
   * Creates a quaternion from the given 3x3 rotation matrix.
   *
   * NOTE: The resultant quaternion is not normalized, so you should be sure
   * to renormalize the quaternion yourself where necessary.
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyMat3} m rotation matrix
   * @returns {quat} out
   * @function
   */

  function fromMat3(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w

      out[3] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)

      out[0] = (m[5] - m[7]) * fRoot;
      out[1] = (m[6] - m[2]) * fRoot;
      out[2] = (m[1] - m[3]) * fRoot;
    } else {
      // |w| <= 1/2
      var i = 0;
      if (m[4] > m[0]) i = 1;
      if (m[8] > m[i * 3 + i]) i = 2;
      var j = (i + 1) % 3;
      var k = (i + 2) % 3;
      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
      out[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
      out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
      out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
  }
  /**
   * Creates a quaternion from the given euler angle x, y, z.
   *
   * @param {quat} out the receiving quaternion
   * @param {x} Angle to rotate around X axis in degrees.
   * @param {y} Angle to rotate around Y axis in degrees.
   * @param {z} Angle to rotate around Z axis in degrees.
   * @returns {quat} out
   * @function
   */

  function fromEuler(out, x, y, z) {
    var halfToRad = 0.5 * Math.PI / 180.0;
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;
    var sx = Math.sin(x);
    var cx = Math.cos(x);
    var sy = Math.sin(y);
    var cy = Math.cos(y);
    var sz = Math.sin(z);
    var cz = Math.cos(z);
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
    return out;
  }
  /**
   * Creates a new quat initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @param {Number} w W component
   * @returns {quat} a new quaternion
   * @function
   */

  var fromValues = fromValues$1;
  /**
   * Set the components of a quat to the given values
   *
   * @param {quat} out the receiving quaternion
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @param {Number} w W component
   * @returns {quat} out
   * @function
   */

  var set = set$1;
  /**
   * Normalize a quat
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a quaternion to normalize
   * @returns {quat} out
   * @function
   */

  var normalize = normalize$1;
  /**
   * Sets a quaternion to represent the shortest rotation from one
   * vector to another.
   *
   * Both vectors are assumed to be unit length.
   *
   * @param {quat} out the receiving quaternion.
   * @param {ReadonlyVec3} a the initial vector
   * @param {ReadonlyVec3} b the destination vector
   * @returns {quat} out
   */

  var rotationTo = function () {
    var tmpvec3 = create$2();
    var xUnitVec3 = fromValues$2(1, 0, 0);
    var yUnitVec3 = fromValues$2(0, 1, 0);
    return function (out, a, b) {
      var dot$1 = dot(a, b);

      if (dot$1 < -0.999999) {
        cross(tmpvec3, xUnitVec3, a);
        if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
        normalize$2(tmpvec3, tmpvec3);
        setAxisAngle(out, tmpvec3, Math.PI);
        return out;
      } else if (dot$1 > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
      } else {
        cross(tmpvec3, a, b);
        out[0] = tmpvec3[0];
        out[1] = tmpvec3[1];
        out[2] = tmpvec3[2];
        out[3] = 1 + dot$1;
        return normalize(out, out);
      }
    };
  }();
  /**
   * Performs a spherical linear interpolation with two control points
   *
   * @param {quat} out the receiving quaternion
   * @param {ReadonlyQuat} a the first operand
   * @param {ReadonlyQuat} b the second operand
   * @param {ReadonlyQuat} c the third operand
   * @param {ReadonlyQuat} d the fourth operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {quat} out
   */

  (function () {
    var temp1 = create();
    var temp2 = create();
    return function (out, a, b, c, d, t) {
      slerp(temp1, a, d, t);
      slerp(temp2, b, c, t);
      slerp(out, temp1, temp2, 2 * t * (1 - t));
      return out;
    };
  })();
  /**
   * Sets the specified quaternion with values corresponding to the given
   * axes. Each axis is a vec3 and is expected to be unit length and
   * perpendicular to all other specified axes.
   *
   * @param {ReadonlyVec3} view  the vector representing the viewing direction
   * @param {ReadonlyVec3} right the vector representing the local "right" direction
   * @param {ReadonlyVec3} up    the vector representing the local "up" direction
   * @returns {quat} out
   */

  (function () {
    var matr = create$4();
    return function (out, view, right, up) {
      matr[0] = right[0];
      matr[3] = right[1];
      matr[6] = right[2];
      matr[1] = up[0];
      matr[4] = up[1];
      matr[7] = up[2];
      matr[2] = -view[0];
      matr[5] = -view[1];
      matr[8] = -view[2];
      return normalize(out, fromMat3(out, matr));
    };
  })();

  class Vec3 {
    static set(x, y, z, out = new Float32Array(3)) {
      return set$2(out, x, y, z);
    }
    static fromValues(x, y, z) {
      return fromValues$2(x, y, z);
    }
    static create() {
      return create$2();
    }
    static add(a, b, out = new Float32Array(3)) {
      return add(out, a, b);
    }
    static transformQuat(a, q, out = new Float32Array(3)) {
      return transformQuat(out, a, q);
    }
    static subtract(a, b, out = new Float32Array(3)) {
      return subtract(out, a, b);
    }
    static scale(a, b, out = new Float32Array(3)) {
      return scale(out, a, b);
    }
    static dot(a, b) {
      return dot(a, b);
    }
    static normalize(a, out = new Float32Array(3)) {
      return normalize$2(out, a);
    }
    static cross(a, b, out = new Float32Array(3)) {
      return cross(out, a, b);
    }
    static transformMat4(a, m, out = new Float32Array(3)) {
      return transformMat4$1(out, a, m);
    }
    static copy(a, out = new Float32Array(3)) {
      return copy(out, a);
    }
    static magnitude(a) {
      return length(a);
    }
    static squaredMagnitude(a) {
      return squaredLength(a);
    }
    static inverse(a, out = new Float32Array(3)) {
      return inverse(out, a);
    }
    static negate(a, out = new Float32Array(3)) {
      return negate(out, a);
    }
    static multiply(a, b, out = new Float32Array(3)) {
      return multiply(out, a, b);
    }
    static distance(a, b) {
      return distance(a, b);
    }
    static squaredDistance(a, b) {
      return squaredDistance(a, b);
    }
    static lerp(a, b, t, out = new Float32Array(3)) {
      return lerp(out, a, b, t);
    }
  }

  class Quat {
    static set(x, y, z, w, out = new Float32Array(4)) {
      return set(out, x, y, z, w);
    }
    static fromValues(x, y, z, w) {
      return fromValues(x, y, z, w);
    }
    static create() {
      return create();
    }
    static normalize(a, out = new Float32Array(4)) {
      return normalize(out, a);
    }
    static slerp(a, b, t, out = new Float32Array(4)) {
      return slerp(out, a, b, t);
    }
    static fromEuler(x, y, z, out = new Float32Array(4)) {
      return fromEuler(out, x, y, z);
    }
    static conjugate(a, out = new Float32Array(4)) {
      return conjugate(out, a);
    }
    static rotateX(a, rad, out = new Float32Array(4)) {
      return rotateX(out, a, rad);
    }
    static rotateY(a, rad, out = new Float32Array(4)) {
      return rotateY(out, a, rad);
    }
    static rotateZ(a, rad, out = new Float32Array(4)) {
      return rotateZ(out, a, rad);
    }
    static rotationTo(from, to, out = new Float32Array(4)) {
      return rotationTo(out, from, to);
    }
  }

  const temp$2 = new Float32Array(4);
  class Quaternion extends math.ObservablePoint {
    constructor(x = 0, y = 0, z = 0, w = 1, cb = () => {
    }, scope = void 0) {
      super(cb, scope);
      this._array = new Float32Array(4);
      this._array.set([x, y, z, w]);
    }
    get array() {
      return this._array;
    }
    set array(value) {
      this.setFrom(value);
    }
    get x() {
      return this._array[0];
    }
    set x(value) {
      if (this._array[0] !== value) {
        this._array[0] = value;
        this.cb.call(this.scope);
      }
    }
    get y() {
      return this._array[1];
    }
    set y(value) {
      if (this._array[1] !== value) {
        this._array[1] = value;
        this.cb.call(this.scope);
      }
    }
    get z() {
      return this._array[2];
    }
    set z(value) {
      if (this._array[2] !== value) {
        this._array[2] = value;
        this.cb.call(this.scope);
      }
    }
    get w() {
      return this._array[3];
    }
    set w(value) {
      if (this._array[3] !== value) {
        this._array[3] = value;
        this.cb.call(this.scope);
      }
    }
    setEulerAngles(x, y, z) {
      Quat.fromEuler(x, y, z, this._array);
      this.cb.call(this.scope);
    }
    clone(cb = this.cb, scope = this.scope) {
      return new Quaternion(this.x, this.y, this.z, this.w, cb, scope);
    }
    copyFrom(p) {
      if (this._array[0] !== p.x || this._array[1] !== p.y || this._array[2] !== p.z || this._array[3] !== p.w) {
        this._array[0] = p.x;
        this._array[1] = p.y;
        this._array[2] = p.z;
        this._array[3] = p.w;
        this.cb.call(this.scope);
      }
      return this;
    }
    copyTo(p) {
      if (p instanceof Quaternion) {
        p.set(this.x, this.y, this.z, this.w);
      }
      return p;
    }
    equals(p) {
      return p.x === this.x && p.y === this.y && p.z === this.z && p.w === this.w;
    }
    set(x, y = x, z = x, w = x) {
      if (this._array[0] !== x || this._array[1] !== y || this._array[2] !== z || this._array[3] !== w) {
        this._array[0] = x;
        this._array[1] = y;
        this._array[2] = z;
        this._array[3] = w;
        this.cb.call(this.scope);
      }
      return this;
    }
    setFrom(array) {
      this.set(array[0], array[1], array[2], array[3]);
      return this;
    }
    normalize(out = new Quaternion()) {
      return out.setFrom(Quat.normalize(this._array, temp$2));
    }
    static slerp(a, b, t, out = new Quaternion()) {
      return out.setFrom(Quat.slerp(a.array, b.array, t, temp$2));
    }
    static fromEuler(x, y, z, out = new Quaternion()) {
      return out.setFrom(Quat.fromEuler(x, y, z, temp$2));
    }
    static conjugate(a, out = new Quaternion()) {
      return out.setFrom(Quat.conjugate(a.array, temp$2));
    }
    static rotateX(a, rad, out = new Quaternion()) {
      return out.setFrom(Quat.rotateX(a.array, rad, temp$2));
    }
    static rotateY(a, rad, out = new Quaternion()) {
      return out.setFrom(Quat.rotateY(a.array, rad, temp$2));
    }
    static rotateZ(a, rad, out = new Quaternion()) {
      return out.setFrom(Quat.rotateZ(a.array, rad, temp$2));
    }
  }

  class Mat4 {
    static getTranslation(mat, out = new Float32Array(3)) {
      return getTranslation(out, mat);
    }
    static create() {
      return create$3();
    }
    static translate(mat, v, out = new Float32Array(16)) {
      return translate(out, mat, v);
    }
    static getScaling(mat, out = new Float32Array(3)) {
      return getScaling(out, mat);
    }
    static getRotation(mat, out = new Float32Array(4)) {
      return getRotation(out, mat);
    }
    static copy(a, out = new Float32Array(16)) {
      return copy$1(out, a);
    }
    static fromQuat(q, out = new Float32Array(16)) {
      return fromQuat(out, q);
    }
    static fromRotationTranslationScale(q, v, s, out = new Float32Array(16)) {
      return fromRotationTranslationScale(out, q, v, s);
    }
    static fromRotation(rad, axis, out = new Float32Array(16)) {
      return fromRotation(out, rad, axis);
    }
    static fromScaling(v, out = new Float32Array(16)) {
      return fromScaling(out, v);
    }
    static fromTranslation(v, out = new Float32Array(16)) {
      return fromTranslation(out, v);
    }
    static multiply(a, b, out = new Float32Array(16)) {
      return multiply$1(out, a, b);
    }
    static lookAt(eye, center, up, out = new Float32Array(16)) {
      return lookAt(out, eye, center, up);
    }
    static identity(out = new Float32Array(16)) {
      return identity(out);
    }
    static perspective(fovy, aspect, near, far, out = new Float32Array(16)) {
      return perspective(out, fovy, aspect, near, far);
    }
    static ortho(left, right, bottom, top, near, far, out = new Float32Array(16)) {
      return ortho(out, left, right, bottom, top, near, far);
    }
    static invert(a, out = new Float32Array(16)) {
      return invert(out, a);
    }
    static transpose(a, out = new Float32Array(16)) {
      return transpose(out, a);
    }
    static targetTo(eye, target, up, out = new Float32Array(16)) {
      return targetTo(out, eye, target, up);
    }
    static rotateX(a, rad, out = new Float32Array(16)) {
      return rotateX$1(out, a, rad);
    }
    static rotateY(a, rad, out = new Float32Array(16)) {
      return rotateY$1(out, a, rad);
    }
    static rotateZ(a, rad, out = new Float32Array(16)) {
      return rotateZ$1(out, a, rad);
    }
    static rotate(a, rad, axis, out = new Float32Array(16)) {
      return rotate(out, a, rad, axis);
    }
    static scale(a, v, out = new Float32Array(16)) {
      return scale$1(out, a, v);
    }
  }

  class MatrixComponent {
    constructor(_parent, _data, _update) {
      this._parent = _parent;
      this._data = _data;
      this._update = _update;
    }
    get data() {
      if (this._id !== this._parent.transformId) {
        this._update(this._data);
        this._id = this._parent.transformId;
      }
      return this._data;
    }
  }

  const temp$1 = new Float32Array(16);
  class Matrix4x4 extends math.Matrix {
    constructor(array) {
      super();
      this._transformId = 0;
      if (array) {
        this.array = new Float32Array(array);
      } else {
        this.array = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      }
    }
    get transformId() {
      return this._transformId;
    }
    toArray(transpose, out) {
      if (transpose) {
        return Mat4.transpose(this.array, out);
      }
      return out ? Mat4.copy(this.array, out) : this.array;
    }
    get position() {
      if (!this._position) {
        this._position = new MatrixComponent(this, new Point3D(), (data) => {
          Mat4.getTranslation(this.array, data.array);
        });
      }
      return this._position.data;
    }
    get scaling() {
      if (!this._scaling) {
        this._scaling = new MatrixComponent(this, new Point3D(), (data) => {
          Mat4.getScaling(this.array, data.array);
        });
      }
      return this._scaling.data;
    }
    get rotation() {
      if (!this._rotation) {
        let matrix = new Float32Array(16);
        this._rotation = new MatrixComponent(this, new Quaternion(), (data) => {
          for (let col = 0; col < 3; col++) {
            matrix[col + 0] = this.array[col + 0] / this.scaling.x;
            matrix[col + 4] = this.array[col + 4] / this.scaling.y;
            matrix[col + 8] = this.array[col + 8] / this.scaling.z;
          }
          Quat.normalize(Mat4.getRotation(matrix, data.array), data.array);
        });
      }
      return this._rotation.data;
    }
    get up() {
      if (!this._up) {
        this._up = new MatrixComponent(this, new Point3D(), (data) => {
          Vec3.normalize(Vec3.set(
            this.array[4],
            this.array[5],
            this.array[6],
            data.array
          ), data.array);
        });
      }
      return this._up.data;
    }
    get down() {
      if (!this._down) {
        this._down = new MatrixComponent(this, new Point3D(), (data) => {
          Vec3.negate(this.up.array, data.array);
        });
      }
      return this._down.data;
    }
    get right() {
      if (!this._right) {
        this._right = new MatrixComponent(this, new Point3D(), (data) => {
          Vec3.negate(this.left.array, data.array);
        });
      }
      return this._right.data;
    }
    get left() {
      if (!this._left) {
        this._left = new MatrixComponent(this, new Point3D(), (data) => {
          Vec3.normalize(
            Vec3.cross(this.up.array, this.forward.array, data.array),
            data.array
          );
        });
      }
      return this._left.data;
    }
    get forward() {
      if (!this._forward) {
        this._forward = new MatrixComponent(this, new Point3D(), (data) => {
          Vec3.normalize(Vec3.set(
            this.array[8],
            this.array[9],
            this.array[10],
            data.array
          ), data.array);
        });
      }
      return this._forward.data;
    }
    get backward() {
      if (!this._backward) {
        this._backward = new MatrixComponent(this, new Point3D(), (data) => {
          Vec3.negate(this.forward.array, data.array);
        });
      }
      return this._backward.data;
    }
    copyFrom(matrix) {
      if (matrix instanceof Matrix4x4) {
        Mat4.copy(matrix.array, this.array);
        this._transformId++;
      }
      return this;
    }
    setFrom(array) {
      Mat4.copy(array, this.array);
      this._transformId++;
      return this;
    }
    setFromRotationPositionScale(rotation, position, scaling) {
      Mat4.fromRotationTranslationScale(
        rotation.array,
        position.array,
        scaling.array,
        this.array
      );
      this._transformId++;
    }
    multiply(matrix) {
      Mat4.multiply(matrix.array, this.array, this.array);
      this._transformId++;
    }
    static translate(mat, v, out = new Matrix4x4()) {
      return out.setFrom(Mat4.translate(mat.array, v.array, temp$1));
    }
    static fromQuaternion(q, out = new Matrix4x4()) {
      return out.setFrom(Mat4.fromQuat(q.array, temp$1));
    }
    static fromRotationTranslationScale(q, v, s, out = new Matrix4x4()) {
      return out.setFrom(Mat4.fromRotationTranslationScale(q.array, v.array, s.array, temp$1));
    }
    static fromRotation(rad, axis, out = new Matrix4x4()) {
      return out.setFrom(Mat4.fromRotation(rad, axis.array, temp$1));
    }
    static fromScaling(v, out = new Matrix4x4()) {
      return out.setFrom(Mat4.fromScaling(v.array, temp$1));
    }
    static fromTranslation(v, out = new Matrix4x4()) {
      return out.setFrom(Mat4.fromTranslation(v.array, temp$1));
    }
    static lookAt(eye, center, up, out = new Matrix4x4()) {
      return out.setFrom(Mat4.lookAt(eye.array, center.array, up.array, temp$1));
    }
    static identity(out = new Matrix4x4()) {
      return out.setFrom(Mat4.identity(temp$1));
    }
    static perspective(fovy, aspect, near, far, out = new Matrix4x4()) {
      return out.setFrom(Mat4.perspective(fovy, aspect, near, far, temp$1));
    }
    static ortho(left, right, bottom, top, near, far, out = new Matrix4x4()) {
      return out.setFrom(Mat4.ortho(left, right, bottom, top, near, far, temp$1));
    }
    static invert(a, out = new Matrix4x4()) {
      return out.setFrom(Mat4.invert(a.array, temp$1));
    }
    static transpose(a, out = new Matrix4x4()) {
      return out.setFrom(Mat4.transpose(a.array, temp$1));
    }
    static targetTo(eye, target, up, out = new Matrix4x4()) {
      return out.setFrom(Mat4.targetTo(eye.array, target.array, up.array, temp$1));
    }
    static rotateX(a, rad, out = new Matrix4x4()) {
      return out.setFrom(Mat4.rotateX(a.array, rad, temp$1));
    }
    static rotateY(a, rad, out = new Matrix4x4()) {
      return out.setFrom(Mat4.rotateY(a.array, rad, temp$1));
    }
    static rotateZ(a, rad, out = new Matrix4x4()) {
      return out.setFrom(Mat4.rotateZ(a.array, rad, temp$1));
    }
    static rotate(a, rad, axis, out = new Matrix4x4()) {
      return out.setFrom(Mat4.rotate(a.array, rad, axis.array, temp$1));
    }
    static scale(a, v, out = new Matrix4x4()) {
      return out.setFrom(Mat4.scale(a.array, v.array, temp$1));
    }
  }

  const temp = new Float32Array(3);
  class Point3D extends math.ObservablePoint {
    constructor(x = 0, y = 0, z = 0, cb = () => {
    }, scope = void 0) {
      super(cb, scope);
      this._array = new Float32Array(3);
      this._array.set([x, y, z]);
    }
    get array() {
      return this._array;
    }
    set array(value) {
      this.setFrom(value);
    }
    get x() {
      return this._array[0];
    }
    set x(value) {
      if (this._array[0] !== value) {
        this._array[0] = value;
        this.cb.call(this.scope);
      }
    }
    get y() {
      return this._array[1];
    }
    set y(value) {
      if (this._array[1] !== value) {
        this._array[1] = value;
        this.cb.call(this.scope);
      }
    }
    get z() {
      return this._array[2];
    }
    set z(value) {
      if (this._array[2] !== value) {
        this._array[2] = value;
        this.cb.call(this.scope);
      }
    }
    clone(cb = this.cb, scope = this.scope) {
      return new Point3D(this.x, this.y, this.z, cb, scope);
    }
    copyFrom(p) {
      if (this._array[0] !== p.x || this._array[1] !== p.y || this._array[2] !== p.z) {
        this._array[0] = p.x;
        this._array[1] = p.y;
        this._array[2] = p.z;
        this.cb.call(this.scope);
      }
      return this;
    }
    copyTo(p) {
      if (p instanceof Point3D) {
        p.set(this.x, this.y, this.z);
      }
      return p;
    }
    equals(p) {
      return p.x === this.x && p.y === this.y && p.z === this.z;
    }
    set(x, y = x, z = x) {
      if (this._array[0] !== x || this._array[1] !== y || this._array[2] !== z) {
        this._array[0] = x;
        this._array[1] = y;
        this._array[2] = z;
        this.cb.call(this.scope);
      }
      return this;
    }
    setFrom(array) {
      this.set(array[0], array[1], array[2]);
      return this;
    }
    normalize(out = new Point3D()) {
      return out.setFrom(Vec3.normalize(this._array, temp));
    }
    get magnitude() {
      return Vec3.magnitude(this._array);
    }
    static dot(a, b) {
      return Vec3.dot(a._array, b._array);
    }
    static add(a, b, out = new Point3D()) {
      return out.setFrom(Vec3.add(a._array, b._array, temp));
    }
    static subtract(a, b, out = new Point3D()) {
      return out.setFrom(Vec3.subtract(a._array, b._array, temp));
    }
    static cross(a, b, out = new Point3D()) {
      return out.setFrom(Vec3.cross(a._array, b._array, temp));
    }
    static inverse(a, out = new Point3D()) {
      return out.setFrom(Vec3.inverse(a._array, temp));
    }
    static distance(a, b) {
      return Vec3.distance(a._array, b._array);
    }
    static squaredDistance(a, b) {
      return Vec3.squaredDistance(a._array, b._array);
    }
    static multiply(a, b, out = new Point3D()) {
      return out.setFrom(Vec3.multiply(a._array, b._array, temp));
    }
    static negate(a, out = new Point3D()) {
      return out.setFrom(Vec3.negate(a._array, temp));
    }
    static transform(a, m, out = new Point3D()) {
      if (m instanceof Matrix4x4) {
        return out.setFrom(Vec3.transformMat4(a._array, m.array, temp));
      }
      return out.setFrom(Vec3.transformQuat(a._array, m.array, temp));
    }
    static lerp(a, b, t, out = new Point3D()) {
      return out.setFrom(Vec3.lerp(a._array, b._array, t, temp));
    }
    static scale(a, b, out = new Point3D()) {
      return out.setFrom(Vec3.scale(a._array, b, temp));
    }
  }

  class Transform3D extends math.Transform {
    constructor() {
      super(...arguments);
      this.position = new Point3D(0, 0, 0, this.onChange, this);
      this.scale = new Point3D(1, 1, 1, this.onChange, this);
      this.rotationQuaternion = new Quaternion(0, 0, 0, 1, this.onChange, this);
      this.worldTransform = new Matrix4x4();
      this.localTransform = new Matrix4x4();
      this.inverseWorldTransform = new Matrix4x4();
      this.normalTransform = new Matrix4x4();
    }
    updateLocalTransform() {
      if (this._localID === this._currentLocalID) {
        return;
      }
      this.localTransform.setFromRotationPositionScale(
        this.rotationQuaternion,
        this.position,
        this.scale
      );
      this._parentID = -1;
      this._currentLocalID = this._localID;
    }
    setFromMatrix(matrix) {
      this.localTransform.copyFrom(matrix);
      this.position.copyFrom(this.localTransform.position);
      this.scale.copyFrom(this.localTransform.scaling);
      this.rotationQuaternion.copyFrom(this.localTransform.rotation);
    }
    updateTransform(parentTransform) {
      this.updateLocalTransform();
      if (parentTransform && this._parentID === parentTransform._worldID) {
        return;
      }
      this.worldTransform.copyFrom(this.localTransform);
      if (parentTransform instanceof Transform3D) {
        this.worldTransform.multiply(parentTransform.worldTransform);
      }
      Mat4.invert(this.worldTransform.array, this.inverseWorldTransform.array);
      Mat4.transpose(this.inverseWorldTransform.array, this.normalTransform.array);
      this._worldID++;
      if (parentTransform) {
        this._parentID = parentTransform._worldID;
      }
    }
    lookAt(point, up = new Point3D(0, 1, 0)) {
      if (up instanceof Point3D) {
        up = up.array;
      }
      let rot = Mat4.getRotation(
        Mat4.targetTo(point.array, this.worldTransform.position.array, up)
      );
      this.rotationQuaternion.set(rot[0], rot[1], rot[2], rot[3]);
    }
  }

  class Container3D extends display.Container {
    constructor() {
      super(...arguments);
      this.transform = new Transform3D();
    }
    set position(value) {
      this.transform.position.copyFrom(value);
    }
    get position() {
      return this.transform.position;
    }
    set scale(value) {
      this.transform.scale.copyFrom(value);
    }
    get scale() {
      return this.transform.scale;
    }
    set rotationQuaternion(value) {
      this.transform.rotationQuaternion.copyFrom(value);
    }
    get rotationQuaternion() {
      return this.transform.rotationQuaternion;
    }
    get z() {
      return this.transform.position.z;
    }
    set z(value) {
      this.transform.position.z = value;
    }
    get localTransform() {
      return this.transform.localTransform;
    }
    get worldTransform() {
      return this.transform.worldTransform;
    }
  }

  class Ray {
    constructor(origin, direction) {
      this._direction = new Point3D();
      this._origin = new Point3D();
      this._origin.copyFrom(origin);
      this._direction.copyFrom(direction);
    }
    get origin() {
      return this._origin;
    }
    get direction() {
      return this._direction;
    }
    getPoint(distance, point = new Point3D()) {
      return Point3D.add(
        this._origin,
        Point3D.scale(this._direction, distance, point),
        point
      );
    }
  }

  class Vec4 {
    static set(x, y, z, w, out = new Float32Array(4)) {
      return set$1(out, x, y, z, w);
    }
    static transformMat4(a, m, out = new Float32Array(4)) {
      return transformMat4(out, a, m);
    }
    static fromValues(x, y, z, w) {
      return fromValues$1(x, y, z, w);
    }
  }

  const vec3$1 = new Float32Array(3);
  const mat4 = new Float32Array(16);
  const vec4 = new Float32Array(4);
  class Camera extends Container3D {
    constructor(renderer) {
      super();
      this.renderer = renderer;
      this._transformId = 0;
      this._orthographic = false;
      this._orthographicSize = 10;
      this._obliqueness = new math.ObservablePoint(() => {
        this._transformId++;
      }, void 0);
      this._fieldOfView = 60;
      this._near = 0.1;
      this._far = 1e3;
      let aspect = renderer.width / renderer.height;
      let localID = -1;
      this.renderer.on("prerender", () => {
        if (!this._aspect) {
          if (renderer.width / renderer.height !== aspect) {
            this._transformId++;
            aspect = renderer.width / renderer.height;
          }
        }
        if (!this.parent && localID !== this.transform._localID) {
          this.transform.updateTransform();
          localID = this.transform._localID;
        }
      });
      if (!Camera.main) {
        Camera.main = this;
      }
      this.transform.position.z = 5;
      this.transform.rotationQuaternion.setEulerAngles(0, 180, 0);
    }
    get transformId() {
      return this.transform._worldID + this._transformId;
    }
    get obliqueness() {
      return this._obliqueness;
    }
    set obliqueness(value) {
      this._obliqueness.copyFrom(value);
    }
    destroy(options) {
      super.destroy(options);
      if (this === Camera.main) {
        Camera.main = void 0;
      }
    }
    get orthographicSize() {
      return this._orthographicSize;
    }
    set orthographicSize(value) {
      if (this._orthographicSize !== value) {
        this._orthographicSize = value;
        this._transformId++;
      }
    }
    get orthographic() {
      return this._orthographic;
    }
    set orthographic(value) {
      if (this._orthographic !== value) {
        this._orthographic = value;
        this._transformId++;
      }
    }
    screenToRay(x, y, viewSize = this.renderer.screen) {
      let screen = this.screenToWorld(x, y, 1, void 0, viewSize);
      if (screen) {
        if (this.orthographic) {
          return new Ray(screen, this.worldTransform.forward);
        }
        return new Ray(
          this.worldTransform.position,
          Point3D.subtract(screen, this.worldTransform.position)
        );
      }
    }
    screenToWorld(x, y, distance, point = new Point3D(), viewSize = this.renderer.screen) {
      var _a;
      this.transform.updateTransform((_a = this.parent) == null ? void 0 : _a.transform);
      let far = this.far;
      this.far = distance;
      let invertedViewProjection = Mat4.invert(this.viewProjection.array, mat4);
      if (invertedViewProjection === null) {
        return;
      }
      let clipSpace = Vec4.set(
        x / viewSize.width * 2 - 1,
        (y / viewSize.height * 2 - 1) * -1,
        1,
        1,
        vec4
      );
      this.far = far;
      let worldSpace = Vec4.transformMat4(clipSpace, invertedViewProjection, vec4);
      worldSpace[3] = 1 / worldSpace[3];
      for (let i = 0; i < 3; i++) {
        worldSpace[i] *= worldSpace[3];
      }
      return point.set(worldSpace[0], worldSpace[1], worldSpace[2]);
    }
    worldToScreen(x, y, z, point = new math.Point(), viewSize = this.renderer.screen) {
      var _a;
      this.transform.updateTransform((_a = this.parent) == null ? void 0 : _a.transform);
      let worldSpace = Vec4.set(x, y, z, 1, vec4);
      let clipSpace = Vec4.transformMat4(
        Vec4.transformMat4(worldSpace, this.view.array, vec4),
        this.projection.array,
        vec4
      );
      if (clipSpace[3] !== 0) {
        for (let i = 0; i < 3; i++) {
          clipSpace[i] /= clipSpace[3];
        }
      }
      return point.set((clipSpace[0] + 1) / 2 * viewSize.width, viewSize.height - (clipSpace[1] + 1) / 2 * viewSize.height);
    }
    get aspect() {
      return this._aspect;
    }
    set aspect(value) {
      if (this._aspect !== value) {
        this._aspect = value;
        this._transformId++;
      }
    }
    get fieldOfView() {
      return this._fieldOfView;
    }
    set fieldOfView(value) {
      if (this._fieldOfView !== value) {
        this._fieldOfView = value;
        this._transformId++;
      }
    }
    get near() {
      return this._near;
    }
    set near(value) {
      if (this._near !== value) {
        this._near = value;
        this._transformId++;
      }
    }
    get far() {
      return this._far;
    }
    set far(value) {
      if (this._far !== value) {
        this._far = value;
        this._transformId++;
      }
    }
    get projection() {
      if (!this._projection) {
        this._projection = new MatrixComponent(this, new Matrix4x4(), (data) => {
          const aspect = this._aspect || this.renderer.width / this.renderer.height;
          if (this._orthographic) {
            Mat4.ortho(-this._orthographicSize * aspect, this._orthographicSize * aspect, -this._orthographicSize, this._orthographicSize, this._near, this._far, data.array);
          } else {
            Mat4.perspective(this._fieldOfView * math.DEG_TO_RAD, aspect, this._near, this._far, data.array);
            data.array[8] = this._obliqueness.x;
            data.array[9] = this._obliqueness.y;
          }
        });
      }
      return this._projection.data;
    }
    get view() {
      if (!this._view) {
        this._view = new MatrixComponent(this, new Matrix4x4(), (data) => {
          const target = Vec3.add(
            this.worldTransform.position.array,
            this.worldTransform.forward.array,
            vec3$1
          );
          Mat4.lookAt(
            this.worldTransform.position.array,
            target,
            this.worldTransform.up.array,
            data.array
          );
        });
      }
      return this._view.data;
    }
    get viewProjection() {
      if (!this._viewProjection) {
        this._viewProjection = new MatrixComponent(this, new Matrix4x4(), (data) => {
          Mat4.multiply(this.projection.array, this.view.array, data.array);
        });
      }
      return this._viewProjection.data;
    }
  }
  Compatibility.installRendererPlugin("camera", Camera);

  class CameraOrbitControl {
    constructor(element, camera = Camera.main) {
      this._autoUpdate = true;
      this._allowControl = true;
      this._camera = Camera.main;
      this._target = { x: 0, y: 0, z: 0 };
      this._angles = new math.ObservablePoint(() => {
        this._angles.x = Math.min(Math.max(-85, this._angles.x), 85);
      }, void 0, 0, 180);
      this._distance = 5;
      this._enableDamping = false;
      this._dampingFactor = 0.1;
      this._grabbed = false;
      this._previousPinchDistance = 0;
      this._previousClientX = 0;
      this._previousClientY = 0;
      this._dampingAngles = { x: 0, y: 180 };
      this._dampingDistance = 5;
      this.onPointerDown = (clientX, clientY) => {
        this._grabbed = true;
        this._previousClientX = clientX;
        this._previousClientY = clientY;
      };
      this.onPointerUp = () => {
        this._grabbed = false;
      };
      this.onPointerMove = (clientX, clientY) => {
        if (this._grabbed) {
          const movementX = clientX - this._previousClientX;
          const movementY = clientY - this._previousClientY;
          this.angles.x += movementY * 0.5;
          this.angles.y -= movementX * 0.5;
          this.updateCamera();
          this._previousClientX = clientX;
          this._previousClientY = clientY;
        }
      };
      this.onPreRender = () => {
        if (this.autoUpdate) {
          this.updateCamera();
        }
      };
      this.onMouseDownInteraction = (e) => {
        var _a, _b, _c;
        if (this.allowControl) {
          if (!e.stopped) {
            this._grabbed = true;
            const originalEvent = e.data.originalEvent;
            const touchEvent = originalEvent;
            const mouseEvent = originalEvent;
            const touch = (_a = touchEvent == null ? void 0 : touchEvent.targetTouches) == null ? void 0 : _a[0];
            const clientX = (_b = touch == null ? void 0 : touch.clientX) != null ? _b : mouseEvent == null ? void 0 : mouseEvent.clientX;
            const clientY = (_c = touch == null ? void 0 : touch.clientY) != null ? _c : mouseEvent == null ? void 0 : mouseEvent.clientY;
            this.onPointerDown(clientX, clientY);
          }
        }
      };
      this.onMouseDown = (e) => {
        if (this.allowControl) {
          this.onPointerDown(e.clientX, e.clientY);
        }
      };
      this.onMouseMove = (e) => {
        if (this.allowControl) {
          if (e.buttons === 1) {
            this.onPointerMove(e.clientX, e.clientY);
          }
        }
      };
      this.onMouseUp = (_e) => {
        if (this.allowControl) {
          this.onPointerUp();
        }
      };
      this.onWheel = (e) => {
        if (this.allowControl) {
          this.distance += e.deltaY * 0.01;
          e.preventDefault();
          this.updateCamera();
        }
      };
      this.onTouchStart = (e) => {
        var _a;
        if (this.allowControl) {
          const touch = (_a = e == null ? void 0 : e.targetTouches) == null ? void 0 : _a[0];
          if (touch) {
            const clientX = touch.clientX;
            const clientY = touch.clientY;
            this.onPointerDown(clientX, clientY);
          }
          if (e.touches.length === 2) {
            e.preventDefault();
            this._previousPinchDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        }
      };
      this.onPinch = (e) => {
        if (this.allowControl) {
          e.preventDefault();
          const currentPinchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const deltaPinchDistance = currentPinchDistance - this._previousPinchDistance;
          this.distance -= deltaPinchDistance * 0.1;
          this.updateCamera();
          this._previousPinchDistance = currentPinchDistance;
        }
      };
      this.onTouchMove = (e) => {
        var _a;
        if (this.allowControl) {
          const touch = (_a = e == null ? void 0 : e.targetTouches) == null ? void 0 : _a[0];
          if (e.touches.length === 1 && touch) {
            const clientX = touch.clientX;
            const clientY = touch.clientY;
            this.onPointerMove(clientX, clientY);
          }
          if (e.touches.length === 2) {
            this.onPinch(e);
          }
        }
      };
      this.onTouchEnd = (e) => {
        if (this.allowControl) {
          if (e.touches.length === 0) {
            this.onPointerUp();
          }
        }
      };
      this._element = element;
      this._camera = camera;
      this.bind();
    }
    get autoUpdate() {
      return this._autoUpdate;
    }
    set autoUpdate(value) {
      this._autoUpdate = value;
    }
    get allowControl() {
      return this._allowControl;
    }
    set allowControl(value) {
      this._allowControl = value;
    }
    get camera() {
      return this._camera;
    }
    set camera(value) {
      this._camera = value;
    }
    get target() {
      return this._target;
    }
    set target(value) {
      this._target = value;
    }
    get angles() {
      return this._angles;
    }
    get distance() {
      return this._distance;
    }
    set distance(value) {
      this._distance = Math.min(Math.max(value, 0.01), Number.MAX_SAFE_INTEGER);
    }
    get enableDamping() {
      return this._enableDamping;
    }
    set enableDamping(value) {
      this._enableDamping = value;
    }
    get dampingFactor() {
      return this._dampingFactor;
    }
    set dampingFactor(value) {
      this._dampingFactor = value;
    }
    destroy() {
      this.unbind();
    }
    bind() {
      this.camera.renderer.on("prerender", this.onPreRender);
      let interaction = Compatibility.getInteractionPlugin(this.camera.renderer);
      if (interaction) {
        interaction.on("mousedown", this.onMouseDownInteraction);
      }
      this._element.addEventListener("mousedown", this.onMouseDown);
      this._element.addEventListener("touchstart", this.onTouchStart);
      this._element.addEventListener("wheel", this.onWheel);
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("touchmove", this.onTouchMove);
      window.addEventListener("mouseup", this.onMouseUp);
      window.addEventListener("touchend", this.onTouchEnd);
    }
    unbind() {
      this._element.removeEventListener("mousedown", this.onMouseDown);
      this._element.removeEventListener("touchstart", this.onTouchStart);
      this._element.removeEventListener("wheel", this.onWheel);
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("touchmove", this.onTouchMove);
      window.removeEventListener("mouseup", this.onMouseUp);
      window.removeEventListener("touchend", this.onTouchEnd);
    }
    updateCamera() {
      if (this.enableDamping) {
        this._dampingAngles.x += (this.angles.x - this._dampingAngles.x) * this.dampingFactor;
        this._dampingAngles.y += (this.angles.y - this._dampingAngles.y) * this.dampingFactor;
        this._dampingDistance += (this.distance - this._dampingDistance) * this.dampingFactor;
      }
      const angles = this.enableDamping ? this._dampingAngles : this.angles;
      const distance = this.enableDamping ? this._dampingDistance : this.distance;
      const rot = Quat.fromEuler(angles.x, angles.y, 0, new Float32Array(4));
      const dir = Vec3.transformQuat(
        Vec3.set(0, 0, 1, new Float32Array(3)),
        rot,
        new Float32Array(3)
      );
      const pos = Vec3.subtract(
        Vec3.set(this.target.x, this.target.y, this.target.z, new Float32Array(3)),
        Vec3.scale(dir, distance, new Float32Array(3)),
        new Float32Array(3)
      );
      this.camera.position.set(pos[0], pos[1], pos[2]);
      this.camera.rotationQuaternion.set(rot[0], rot[1], rot[2], rot[3]);
    }
  }

  class MeshGeometry3D {
    constructor() {
      this._shaderGeometry = {};
    }
    getShaderGeometry(shader) {
      return this._shaderGeometry[shader.name];
    }
    addShaderGeometry(shader, instanced) {
      this._shaderGeometry[shader.name] = shader.createShaderGeometry(this, instanced);
    }
    hasShaderGeometry(shader, instanced) {
      if (this._shaderGeometry[shader.name]) {
        return !instanced || instanced && this._shaderGeometry[shader.name].instanced;
      }
      return false;
    }
    destroy() {
      for (let name in this._shaderGeometry) {
        this._shaderGeometry[name].destroy();
      }
      this._shaderGeometry = {};
    }
  }

  var PlaneGeometry;
  ((PlaneGeometry2) => {
    function create() {
      return Object.assign(new MeshGeometry3D(), {
        positions: {
          buffer: new Float32Array([-1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0, 1])
        },
        indices: {
          buffer: new Uint8Array([0, 1, 2, 0, 3, 1])
        },
        normals: {
          buffer: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0])
        },
        uvs: [{
          buffer: new Float32Array([0, 1, 1, 0, 0, 0, 1, 1])
        }]
      });
    }
    PlaneGeometry2.create = create;
  })(PlaneGeometry || (PlaneGeometry = {}));

  var CubeGeometry;
  ((CubeGeometry2) => {
    function create() {
      return Object.assign(new MeshGeometry3D(), {
        positions: {
          buffer: new Float32Array([-1, 1, 1, -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1, -1, 1, 1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, -1, 1, -1, -1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1])
        },
        indices: {
          buffer: new Uint8Array([0, 1, 2, 0, 3, 1, 4, 5, 6, 4, 7, 5, 8, 9, 10, 8, 11, 9, 12, 13, 14, 12, 15, 13, 16, 17, 18, 16, 19, 17, 20, 21, 22, 20, 23, 21])
        },
        normals: {
          buffer: new Float32Array([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0])
        },
        uvs: [{
          buffer: new Float32Array([0.625, 1, 0.375, 0.75, 0.375, 1, 0.625, 0.75, 0.625, 0.75, 0.375, 0.5, 0.375, 0.75, 0.625, 0.5, 0.625, 0.5, 0.375, 0.25, 0.375, 0.5, 0.625, 0.25, 0.625, 0.25, 0.375, 0, 0.375, 0.25, 0.625, 0, 0.375, 0.25, 0.125, 0.5, 0.375, 0.5, 0.125, 0.25, 0.875, 0.25, 0.625, 0.5, 0.875, 0.5, 0.625, 0.25])
        }],
        tangents: {
          buffer: new Float32Array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, -1, 0, 0, 1, -1, 0, 0, 1, -1, 0, 0, 1, -1, 0, 0, 1])
        }
      });
    }
    CubeGeometry2.create = create;
  })(CubeGeometry || (CubeGeometry = {}));

  var QuadGeometry;
  ((QuadGeometry2) => {
    function create() {
      return Object.assign(new MeshGeometry3D(), {
        positions: {
          buffer: new Float32Array([-1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 1, 0])
        },
        indices: {
          buffer: new Uint8Array([0, 2, 1, 0, 1, 3])
        },
        normals: {
          buffer: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1])
        },
        uvs: [{
          buffer: new Float32Array([0, 0, 1, 1, 0, 1, 1, 0])
        }]
      });
    }
    QuadGeometry2.create = create;
  })(QuadGeometry || (QuadGeometry = {}));

  class InstancedMesh3D extends Container3D {
    constructor(mesh, material) {
      super();
      this.mesh = mesh;
      this.material = material;
    }
    destroy(options) {
      super.destroy(options);
      this.mesh.removeInstance(this);
    }
  }

  var LightType = /* @__PURE__ */ ((LightType2) => {
    LightType2["spot"] = "spot";
    LightType2["directional"] = "directional";
    LightType2["point"] = "point";
    return LightType2;
  })(LightType || {});

  var StandardMaterialAlphaMode = /* @__PURE__ */ ((StandardMaterialAlphaMode2) => {
    StandardMaterialAlphaMode2["opaque"] = "opaque";
    StandardMaterialAlphaMode2["mask"] = "mask";
    StandardMaterialAlphaMode2["blend"] = "blend";
    return StandardMaterialAlphaMode2;
  })(StandardMaterialAlphaMode || {});

  var StandardMaterialDebugMode = /* @__PURE__ */ ((StandardMaterialDebugMode2) => {
    StandardMaterialDebugMode2["alpha"] = "alpha";
    StandardMaterialDebugMode2["emissive"] = "emissive";
    StandardMaterialDebugMode2["f0"] = "f0";
    StandardMaterialDebugMode2["metallic"] = "metallic";
    StandardMaterialDebugMode2["normal"] = "normal";
    StandardMaterialDebugMode2["occlusion"] = "occlusion";
    StandardMaterialDebugMode2["roughness"] = "roughness";
    return StandardMaterialDebugMode2;
  })(StandardMaterialDebugMode || {});

  var Capabilities;
  ((Capabilities2) => {
    let _maxVertexUniformVectors;
    function getMaxVertexUniformVectors(renderer) {
      if (_maxVertexUniformVectors !== void 0) {
        return _maxVertexUniformVectors;
      }
      const gl = renderer.gl;
      _maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
      return _maxVertexUniformVectors;
    }
    Capabilities2.getMaxVertexUniformVectors = getMaxVertexUniformVectors;
    let _isFloatTextureSupported;
    function isFloatingPointTextureSupported(renderer) {
      if (renderer.context.webGLVersion === 2) {
        return true;
      }
      if (_isFloatTextureSupported !== void 0) {
        return _isFloatTextureSupported;
      }
      const gl = renderer.gl;
      _isFloatTextureSupported = !!gl.getExtension("OES_texture_float");
      return _isFloatTextureSupported;
    }
    Capabilities2.isFloatingPointTextureSupported = isFloatingPointTextureSupported;
    let _isHalfFloatFramebufferSupported;
    function isHalfFloatFramebufferSupported(renderer) {
      if (renderer.context.webGLVersion === 2) {
        return true;
      }
      if (_isHalfFloatFramebufferSupported !== void 0) {
        return _isHalfFloatFramebufferSupported;
      }
      const gl = renderer.gl;
      const ext = gl.getExtension("OES_texture_half_float");
      if (!ext) {
        return false;
      }
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8, 8, 0, gl.RGBA, ext.HALF_FLOAT_OES, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      const attachmentPoint = gl.COLOR_ATTACHMENT0;
      gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);
      _isHalfFloatFramebufferSupported = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      return _isHalfFloatFramebufferSupported;
    }
    Capabilities2.isHalfFloatFramebufferSupported = isHalfFloatFramebufferSupported;
    let _isFloatFramebufferSupported;
    function isFloatFramebufferSupported(renderer) {
      if (renderer.context.webGLVersion === 2) {
        return true;
      }
      if (_isFloatFramebufferSupported !== void 0) {
        return _isFloatFramebufferSupported;
      }
      const gl = renderer.gl;
      const ext = gl.getExtension("OES_texture_float");
      if (!ext) {
        return false;
      }
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8, 8, 0, gl.RGBA, gl.FLOAT, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      const attachmentPoint = gl.COLOR_ATTACHMENT0;
      gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);
      _isFloatFramebufferSupported = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      return _isFloatFramebufferSupported;
    }
    Capabilities2.isFloatFramebufferSupported = isFloatFramebufferSupported;
    let _isFloatLinearSupported;
    function supportsFloatLinear(renderer) {
      if (_isFloatLinearSupported !== void 0) {
        return _isFloatLinearSupported;
      }
      const gl = renderer.gl;
      _isFloatLinearSupported = gl.getExtension("OES_texture_float_linear") !== null;
      return _isFloatLinearSupported;
    }
    Capabilities2.supportsFloatLinear = supportsFloatLinear;
    function isShaderTextureLodSupported(renderer) {
      if (renderer.context.webGLVersion === 2) {
        return true;
      }
      return renderer.gl.getExtension("EXT_shader_texture_lod") !== null;
    }
    Capabilities2.isShaderTextureLodSupported = isShaderTextureLodSupported;
    let _isInstancingSupported;
    function isInstancingSupported(renderer) {
      if (_isInstancingSupported !== void 0) {
        return _isInstancingSupported;
      }
      const gl = renderer.gl;
      _isInstancingSupported = gl.getExtension("ANGLE_instanced_arrays") !== void 0;
      return _isInstancingSupported;
    }
    Capabilities2.isInstancingSupported = isInstancingSupported;
  })(Capabilities || (Capabilities = {}));

  const BufferResource = CompatibilityAccess.get(PixiCore__namespace, "BufferResource") || CompatibilityAccess.get(PixiCore__namespace, "resources").BufferResource;

  class StandardMaterialMatrixTexture extends PixiCore.Texture {
    constructor(matrixCount) {
      let buffer = new Float32Array(matrixCount * 16);
      let resource = new BufferResource(buffer, { width: 4, height: matrixCount });
      super(new PixiCore.BaseTexture(resource, {
        mipmap: constants.MIPMAP_MODES.OFF,
        wrapMode: constants.WRAP_MODES.CLAMP,
        scaleMode: constants.SCALE_MODES.NEAREST,
        format: constants.FORMATS.RGBA,
        type: constants.TYPES.FLOAT,
        alphaMode: constants.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
        resolution: 1
      }));
      this._buffer = buffer;
    }
    static isSupported(renderer) {
      return Capabilities.isFloatingPointTextureSupported(renderer);
    }
    updateBuffer(buffer) {
      this._buffer.set(buffer);
      this.baseTexture.resource.update();
    }
  }

  exports.Debug = void 0;
  ((Debug2) => {
    const messages = [];
    const eventEmitter = new utils.EventEmitter();
    function on(event, fn, context) {
      eventEmitter.on(event, fn, context);
    }
    Debug2.on = on;
    function warn(message, args) {
      if (!messages.includes(message)) {
        messages.push(message);
        let formatted = formatMessage(message, args);
        console.warn(`PIXI3D: ${formatted}`);
        eventEmitter.emit("warn", formatted);
      }
    }
    Debug2.warn = warn;
    function error(message, args) {
      if (!messages.includes(message)) {
        messages.push(message);
        let formatted = formatMessage(message, args);
        console.error(`PIXI3D: ${formatted}`);
        eventEmitter.emit("error", formatted);
      }
    }
    Debug2.error = error;
    function formatMessage(message, args) {
      let formatted = message;
      let match;
      while ((match = /{(\w*)}/g.exec(formatted)) !== null && args) {
        formatted = formatted.replace(match[0], args[match[1]]);
      }
      return formatted;
    }
  })(exports.Debug || (exports.Debug = {}));

  var Message = /* @__PURE__ */ ((Message2) => {
    Message2["meshVertexSkinningFloatingPointTexturesNotSupported"] = `Mesh is using vertex skinning but floating point textures is not supported on this device/environment. In case of errors, try changing the environment in PixiJS settings. Set "PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2" before creating a renderer/application.`;
    Message2["meshVertexSkinningNumberOfJointsNotSupported"] = `Mesh is using vertex skinning but the number of joints ({joints}) is not supported on this device/environment. Max number of supported joints is {maxJoints}, try reducing the number of joints.`;
    Message2["imageBasedLightingShaderTextureLodNotSupported"] = `Image based lighting is used but shader texture lod is not supported on this device/environment, the material may not be displayed correctly. Try changing the environment in PixiJS settings. Set "PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2" before creating a renderer/application.`;
    return Message2;
  })(Message || {});

  var CubemapFormat = /* @__PURE__ */ ((CubemapFormat2) => {
    CubemapFormat2["ldr"] = "ldr";
    CubemapFormat2["rgbe8"] = "rgbe8";
    return CubemapFormat2;
  })(CubemapFormat || {});

  var StandardMaterialFeatureSet;
  ((StandardMaterialFeatureSet2) => {
    function build(renderer, mesh, geometry, material, lightingEnvironment) {
      let features = [];
      if (mesh.instances.length > 0) {
        features.push("USE_INSTANCING 1");
      }
      if (renderer.context.webGLVersion === 1) {
        features.push("WEBGL1 1");
      }
      if (renderer.context.webGLVersion === 2) {
        features.push("WEBGL2 1");
      }
      if (geometry.colors) {
        if (geometry.colors.componentCount === 3) {
          features.push("HAS_VERTEX_COLOR_VEC3 1");
        } else {
          features.push("HAS_VERTEX_COLOR_VEC4 1");
        }
      }
      if (geometry.normals) {
        features.push("HAS_NORMALS 1");
      }
      if (geometry.uvs && geometry.uvs[0]) {
        features.push("HAS_UV_SET1 1");
      }
      if (geometry.uvs && geometry.uvs[1]) {
        features.push("HAS_UV_SET2 1");
      }
      if (geometry.tangents) {
        features.push("HAS_TANGENTS 1");
      }
      if (geometry.targets) {
        for (let i = 0; i < geometry.targets.length; i++) {
          if (geometry.targets[i].positions) {
            features.push("HAS_TARGET_POSITION" + i);
          }
          if (geometry.targets[i].normals) {
            features.push("HAS_TARGET_NORMAL" + i);
          }
          if (geometry.targets[i].tangents) {
            features.push("HAS_TARGET_TANGENT" + i);
          }
        }
        if (mesh.targetWeights && mesh.targetWeights.length > 0) {
          features.push(`WEIGHT_COUNT ${mesh.targetWeights.length}`);
          features.push("USE_MORPHING 1");
        }
      }
      if (geometry.joints) {
        features.push("HAS_JOINT_SET1 1");
      }
      if (geometry.weights) {
        features.push("HAS_WEIGHT_SET1 1");
      }
      if (mesh.skin) {
        addSkinningFeatures(mesh, features, renderer);
      }
      if (material.unlit) {
        features.push("MATERIAL_UNLIT 1");
      }
      features.push("MATERIAL_METALLICROUGHNESS 1");
      if (lightingEnvironment.fog) {
        features.push("USE_FOG 1");
      }
      if (lightingEnvironment.lights.length > 0) {
        features.push(`LIGHT_COUNT ${lightingEnvironment.lights.length}`);
        features.push("USE_PUNCTUAL 1");
      }
      if (lightingEnvironment.imageBasedLighting) {
        if (!lightingEnvironment.imageBasedLighting.valid) {
          return void 0;
        }
        if (Capabilities.isShaderTextureLodSupported(renderer)) {
          features.push("USE_TEX_LOD 1");
        } else {
          exports.Debug.warn(Message.imageBasedLightingShaderTextureLodNotSupported);
        }
        features.push("USE_IBL 1");
        if (lightingEnvironment.imageBasedLighting.diffuse.cubemapFormat === CubemapFormat.rgbe8) {
          features.push("USE_RGBE 1");
        }
      }
      if (material.shadowCastingLight) {
        features.push("USE_SHADOW_MAPPING 1");
      }
      if (material.baseColorTexture) {
        if (!material.baseColorTexture.valid) {
          return void 0;
        }
        if (material.baseColorTexture.transform) {
          features.push("HAS_BASECOLOR_UV_TRANSFORM 1");
        }
        features.push("HAS_BASE_COLOR_MAP 1");
      }
      if (material.emissiveTexture) {
        if (!material.emissiveTexture.valid) {
          return void 0;
        }
        if (material.emissiveTexture.transform) {
          features.push("HAS_EMISSIVE_UV_TRANSFORM 1");
        }
        features.push("HAS_EMISSIVE_MAP 1");
      }
      if (material.normalTexture) {
        if (!material.normalTexture.valid) {
          return void 0;
        }
        if (material.normalTexture.transform) {
          features.push("HAS_NORMAL_UV_TRANSFORM 1");
        }
        features.push("HAS_NORMAL_MAP 1");
      }
      if (material.metallicRoughnessTexture) {
        if (!material.metallicRoughnessTexture.valid) {
          return void 0;
        }
        if (material.metallicRoughnessTexture.transform) {
          features.push("HAS_METALLICROUGHNESS_UV_TRANSFORM 1");
        }
        features.push("HAS_METALLIC_ROUGHNESS_MAP 1");
      }
      if (material.occlusionTexture) {
        if (!material.occlusionTexture.valid) {
          return void 0;
        }
        if (material.occlusionTexture.transform) {
          features.push("HAS_OCCLUSION_UV_TRANSFORM 1");
        }
        features.push("HAS_OCCLUSION_MAP 1");
      }
      switch (material.alphaMode) {
        case StandardMaterialAlphaMode.opaque: {
          features.push("ALPHAMODE_OPAQUE 1");
          break;
        }
        case StandardMaterialAlphaMode.mask: {
          features.push("ALPHAMODE_MASK 1");
          break;
        }
      }
      if (material.debugMode) {
        features.push("DEBUG_OUTPUT 1");
      }
      switch (material.debugMode) {
        case StandardMaterialDebugMode.alpha: {
          features.push("DEBUG_ALPHA 1");
          break;
        }
        case StandardMaterialDebugMode.emissive: {
          features.push("DEBUG_EMISSIVE 1");
          break;
        }
        case StandardMaterialDebugMode.f0: {
          features.push("DEBUG_F0 1");
          break;
        }
        case StandardMaterialDebugMode.metallic: {
          features.push("DEBUG_METALLIC 1");
          break;
        }
        case StandardMaterialDebugMode.normal: {
          features.push("DEBUG_NORMAL 1");
          break;
        }
        case StandardMaterialDebugMode.occlusion: {
          features.push("DEBUG_OCCLUSION 1");
          break;
        }
        case StandardMaterialDebugMode.roughness: {
          features.push("DEBUG_ROUGHNESS 1");
          break;
        }
      }
      return features;
    }
    StandardMaterialFeatureSet2.build = build;
    function addSkinningFeatures(mesh, features, renderer) {
      if (!mesh.skin) {
        return;
      }
      let uniformsRequiredForOtherFeatures = 20;
      let availableVertexUniforms = Capabilities.getMaxVertexUniformVectors(renderer) - uniformsRequiredForOtherFeatures;
      let uniformsRequiredPerJoint = 8;
      let maxJointCount = Math.floor(availableVertexUniforms / uniformsRequiredPerJoint);
      let uniformsSupported = mesh.skin.joints.length <= maxJointCount;
      const addFeatureSetForUniforms = () => {
        var _a;
        features.push("USE_SKINNING 1");
        features.push(`JOINT_COUNT ${(_a = mesh.skin) == null ? void 0 : _a.joints.length}`);
      };
      const addFeatureSetForTextures = () => {
        var _a;
        features.push("USE_SKINNING 1");
        features.push(`JOINT_COUNT ${(_a = mesh.skin) == null ? void 0 : _a.joints.length}`);
        features.push("USE_SKINNING_TEXTURE 1");
      };
      if (settings.settings.PREFER_UNIFORMS_WHEN_UPLOADING_SKIN_JOINTS) {
        if (uniformsSupported) {
          addFeatureSetForUniforms();
          return;
        }
        if (StandardMaterialMatrixTexture.isSupported(renderer)) {
          addFeatureSetForTextures();
          return;
        } else {
          exports.Debug.error(Message.meshVertexSkinningNumberOfJointsNotSupported, {
            joints: mesh.skin.joints.length,
            maxJoints: maxJointCount
          });
        }
      } else {
        if (StandardMaterialMatrixTexture.isSupported(renderer)) {
          addFeatureSetForTextures();
          return;
        }
        exports.Debug.warn(Message.meshVertexSkinningFloatingPointTexturesNotSupported);
        if (uniformsSupported) {
          addFeatureSetForUniforms();
        } else {
          exports.Debug.error(Message.meshVertexSkinningNumberOfJointsNotSupported, {
            joints: mesh.skin.joints.length,
            maxJoints: maxJointCount
          });
        }
      }
    }
    function hasSkinningTextureFeature(features) {
      return features.includes("USE_SKINNING_TEXTURE 1");
    }
    StandardMaterialFeatureSet2.hasSkinningTextureFeature = hasSkinningTextureFeature;
  })(StandardMaterialFeatureSet || (StandardMaterialFeatureSet = {}));

  class MeshShader extends PixiCore.Shader {
    constructor() {
      super(...arguments);
      this._state = Object.assign(new PixiCore.State(), {
        culling: true,
        clockwiseFrontFace: false,
        depthTest: true
      });
    }
    get name() {
      return "mesh-shader";
    }
    createShaderGeometry(geometry, instanced) {
      let result = new PixiCore.Geometry();
      if (geometry.indices) {
        if (geometry.indices.buffer.BYTES_PER_ELEMENT === 1) {
          result.addIndex(new PixiCore.Buffer(new Uint16Array(geometry.indices.buffer)));
        } else {
          result.addIndex(new PixiCore.Buffer(geometry.indices.buffer));
        }
      }
      if (geometry.positions) {
        result.addAttribute(
          "a_Position",
          new PixiCore.Buffer(geometry.positions.buffer),
          3,
          geometry.positions.normalized,
          geometry.positions.componentType,
          geometry.positions.stride
        );
      }
      if (geometry.uvs && geometry.uvs[0]) {
        result.addAttribute(
          "a_UV1",
          new PixiCore.Buffer(geometry.uvs[0].buffer),
          2,
          geometry.uvs[0].normalized,
          geometry.uvs[0].componentType,
          geometry.uvs[0].stride
        );
      }
      if (geometry.normals) {
        result.addAttribute(
          "a_Normal",
          new PixiCore.Buffer(geometry.normals.buffer),
          3,
          geometry.normals.normalized,
          geometry.normals.componentType,
          geometry.normals.stride
        );
      }
      if (geometry.tangents) {
        result.addAttribute(
          "a_Tangent",
          new PixiCore.Buffer(geometry.tangents.buffer),
          4,
          geometry.tangents.normalized,
          geometry.tangents.componentType,
          geometry.tangents.stride
        );
      }
      if (geometry.colors) {
        result.addAttribute(
          "a_Color",
          new PixiCore.Buffer(geometry.colors.buffer),
          geometry.colors.componentCount,
          geometry.colors.normalized,
          geometry.colors.componentType,
          geometry.colors.stride
        );
      }
      return result;
    }
    render(mesh, renderer, state = this._state, drawMode = constants.DRAW_MODES.TRIANGLES) {
      const instanceCount = mesh.instances.filter((i) => i.worldVisible && i.renderable).length;
      const instancing = mesh.instances.length > 0;
      if (!mesh.geometry.hasShaderGeometry(this, instancing)) {
        mesh.geometry.addShaderGeometry(this, instancing);
      }
      let geometry = mesh.geometry.getShaderGeometry(this);
      renderer.shader.bind(this, false);
      renderer.state.set(state);
      renderer.geometry.bind(geometry, this);
      renderer.geometry.draw(drawMode, void 0, void 0, instanceCount);
    }
  }

  class StandardShaderInstancing {
    constructor() {
      this._maxInstances = 200;
      this._modelMatrix = [
        new PixiCore.Buffer(),
        new PixiCore.Buffer(),
        new PixiCore.Buffer(),
        new PixiCore.Buffer()
      ];
      this._normalMatrix = [
        new PixiCore.Buffer(),
        new PixiCore.Buffer(),
        new PixiCore.Buffer(),
        new PixiCore.Buffer()
      ];
      this._baseColor = new PixiCore.Buffer();
      this.expandBuffers(this._maxInstances);
    }
    expandBuffers(instanceCount) {
      while (instanceCount > this._maxInstances) {
        this._maxInstances += Math.floor(this._maxInstances * 0.5);
      }
      for (let i = 0; i < 4; i++) {
        this._modelMatrix[i].update(new Float32Array(4 * this._maxInstances));
        this._normalMatrix[i].update(new Float32Array(4 * this._maxInstances));
      }
      this._baseColor.update(new Float32Array(4 * this._maxInstances));
    }
    updateBuffers(instances) {
      if (instances.length > this._maxInstances) {
        this.expandBuffers(instances.length);
      }
      let bufferIndex = 0;
      for (let i = 0; i < instances.length; i++) {
        const normal = instances[i].transform.normalTransform.array;
        for (let j = 0; j < 4; j++) {
          this._normalMatrix[j].data.set(normal.slice(j * 4, j * 4 + 4), bufferIndex * 4);
        }
        const model = instances[i].worldTransform.array;
        for (let j = 0; j < 4; j++) {
          this._modelMatrix[j].data.set(model.slice(j * 4, j * 4 + 4), bufferIndex * 4);
        }
        const material = instances[i].material;
        this._baseColor.data.set(material.baseColor.rgba, bufferIndex * 4);
        bufferIndex++;
      }
      for (let i = 0; i < 4; i++) {
        this._modelMatrix[i].update();
        this._normalMatrix[i].update();
      }
      this._baseColor.update();
    }
    addGeometryAttributes(geometry) {
      for (let i = 0; i < 4; i++) {
        geometry.addAttribute(
          `a_ModelMatrix${i}`,
          this._modelMatrix[i],
          4,
          false,
          void 0,
          0,
          void 0,
          true
        );
      }
      for (let i = 0; i < 4; i++) {
        geometry.addAttribute(
          `a_NormalMatrix${i}`,
          this._normalMatrix[i],
          4,
          false,
          void 0,
          0,
          void 0,
          true
        );
      }
      geometry.addAttribute(
        "a_BaseColorFactor",
        this._baseColor,
        4,
        false,
        void 0,
        0,
        void 0,
        true
      );
    }
  }

  var StandardShaderSource;
  ((StandardShaderSource2) => {
    function build(source, features, renderer) {
      if (renderer.context.webGLVersion === 1) {
        source = source.replace(/VERSION/, "100").replace(/VERT_IN/g, "attribute").replace(/VERT_OUT/g, "varying").replace(/FRAG_COLOR/g, "gl_FragColor").replace(/FRAG_IN/g, "varying");
      }
      if (renderer.context.webGLVersion === 2) {
        source = source.replace(/VERSION/, "300 es").replace(/VERT_IN/g, "in").replace(/VERT_OUT/g, "out").replace(/FRAG_COLOR/g, "g_finalColor").replace(/FRAG_IN/g, "in");
      }
      return source.replace(
        /#define FEATURES/,
        features.map((value) => `#define ${value}`).join("\n")
      );
    }
    StandardShaderSource2.build = build;
  })(StandardShaderSource || (StandardShaderSource = {}));

  var Shader$b = {"source":"#version VERSION\n\n//\n// This fragment shader defines a reference implementation for Physically Based Shading of\n// a microfacet surface material defined by a glTF model.\n//\n// References:\n// [1] Real Shading in Unreal Engine 4\n//     http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf\n// [2] Physically Based Shading at Disney\n//     http://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v3.pdf\n// [3] README.md - Environment Maps\n//     https://github.com/KhronosGroup/glTF-WebGL-PBR/#environment-maps\n// [4] \"An Inexpensive BRDF Model for Physically based Rendering\" by Christophe Schlick\n//     https://www.cs.virginia.edu/~jdl/bib/appearance/analytic%20models/schlick94b.pdf\n\n#define FEATURES\n\n#if defined(WEBGL1) //&& defined(USE_TEX_LOD)\n#extension GL_EXT_shader_texture_lod : enable\n#endif\n\n#if defined(WEBGL1)\n#extension GL_OES_standard_derivatives : enable\n#endif\n\n#if defined(WEBGL1) && defined(USE_HDR)\n#extension GL_OES_texture_float : enable\n#extension GL_OES_texture_float_linear : enable\n#endif\n\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n\nvec4 _texture(sampler2D sampler, vec2 coord)\n{\n#ifdef WEBGL2\n    return texture(sampler, coord);\n#else\n    return texture2D(sampler, coord);\n#endif\n}\n\nvec4 _texture(samplerCube sampler, vec3 coord)\n{\n#ifdef WEBGL2\n    return texture(sampler, coord);\n#else\n    return textureCube(sampler, coord);\n#endif\n}\nvec4 _textureLod(sampler2D sampler, vec2 coord, float lod)\n{\n#ifdef WEBGL2\n    return textureLod(sampler, coord, lod);\n#endif\n#if defined(WEBGL1) && defined(GL_EXT_shader_texture_lod) \n    return texture2DLodEXT(sampler, coord, lod);\n#endif\n    return vec4(0.0);\n}\n\nvec4 _textureLod(samplerCube sampler, vec3 coord, float lod)\n{\n#ifdef WEBGL2\n    return textureLod(sampler, coord, lod);\n#endif\n#if defined(WEBGL1) && defined(GL_EXT_shader_texture_lod) \n    return textureCubeLodEXT(sampler, coord, lod);\n#endif\n    return vec4(0.0);\n}\nvec3 _dFdx(vec3 coord)\n{\n#if defined(WEBGL2) || defined(GL_OES_standard_derivatives)\n    return dFdx(coord);\n#endif\n    return vec3(0.0);\n}\n\nvec3 _dFdy(vec3 coord)\n{\n#if defined(WEBGL2) || defined(GL_OES_standard_derivatives)\n    return dFdy(coord);\n#endif\n    return vec3(0.0);\n}\nFRAG_IN vec2 v_UVCoord1;\nFRAG_IN vec2 v_UVCoord2;\n\n// General Material\n#ifdef HAS_NORMAL_MAP\nuniform sampler2D u_NormalSampler;\nuniform float u_NormalScale;\nuniform int u_NormalUVSet;\nuniform mat3 u_NormalUVTransform;\n#endif\n\n#ifdef HAS_EMISSIVE_MAP\nuniform sampler2D u_EmissiveSampler;\nuniform int u_EmissiveUVSet;\nuniform vec3 u_EmissiveFactor;\nuniform mat3 u_EmissiveUVTransform;\n#endif\n\n#ifdef HAS_OCCLUSION_MAP\nuniform sampler2D u_OcclusionSampler;\nuniform int u_OcclusionUVSet;\nuniform float u_OcclusionStrength;\nuniform mat3 u_OcclusionUVTransform;\n#endif\n\n// Metallic Roughness Material\n#ifdef HAS_BASE_COLOR_MAP\nuniform sampler2D u_BaseColorSampler;\nuniform int u_BaseColorUVSet;\nuniform mat3 u_BaseColorUVTransform;\n#endif\n\n#ifdef HAS_METALLIC_ROUGHNESS_MAP\nuniform sampler2D u_MetallicRoughnessSampler;\nuniform int u_MetallicRoughnessUVSet;\nuniform mat3 u_MetallicRoughnessUVTransform;\n#endif\n\n// Specular Glossiness Material\n#ifdef HAS_DIFFUSE_MAP\nuniform sampler2D u_DiffuseSampler;\nuniform int u_DiffuseUVSet;\nuniform mat3 u_DiffuseUVTransform;\n#endif\n\n#ifdef HAS_SPECULAR_GLOSSINESS_MAP\nuniform sampler2D u_SpecularGlossinessSampler;\nuniform int u_SpecularGlossinessUVSet;\nuniform mat3 u_SpecularGlossinessUVTransform;\n#endif\n\n// IBL\n#ifdef USE_IBL\nuniform samplerCube u_DiffuseEnvSampler;\nuniform samplerCube u_SpecularEnvSampler;\nuniform sampler2D u_brdfLUT;\n#endif\n\n#ifdef USE_SHADOW_MAPPING\nuniform sampler2D u_ShadowSampler;\n#endif\n\nvec2 getNormalUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_NORMAL_MAP\n    uv.xy = u_NormalUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_NORMAL_UV_TRANSFORM\n    uv = u_NormalUVTransform * uv;\n    #endif\n#endif\n    return uv.xy;\n}\n\nvec2 getEmissiveUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_EMISSIVE_MAP\n    uv.xy = u_EmissiveUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_EMISSIVE_UV_TRANSFORM\n    uv = u_EmissiveUVTransform * uv;\n    #endif\n#endif\n\n    return uv.xy;\n}\n\nvec2 getOcclusionUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_OCCLUSION_MAP\n    uv.xy = u_OcclusionUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_OCCLUSION_UV_TRANSFORM\n    uv = u_OcclusionUVTransform * uv;\n    #endif\n#endif\n    return uv.xy;\n}\n\nvec2 getBaseColorUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_BASE_COLOR_MAP\n    uv.xy = u_BaseColorUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_BASECOLOR_UV_TRANSFORM\n    uv = u_BaseColorUVTransform * uv;\n    #endif\n#endif\n    return uv.xy;\n}\n\nvec2 getMetallicRoughnessUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_METALLIC_ROUGHNESS_MAP\n    uv.xy = u_MetallicRoughnessUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_METALLICROUGHNESS_UV_TRANSFORM\n    uv = u_MetallicRoughnessUVTransform * uv;\n    #endif\n#endif\n    return uv.xy;\n}\n\nvec2 getSpecularGlossinessUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_SPECULAR_GLOSSINESS_MAP\n    uv.xy = u_SpecularGlossinessUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_SPECULARGLOSSINESS_UV_TRANSFORM\n    uv = u_SpecularGlossinessUVTransform * uv;\n    #endif\n#endif\n    return uv.xy;\n}\n\nvec2 getDiffuseUV()\n{\n    vec3 uv = vec3(v_UVCoord1, 1.0);\n#ifdef HAS_DIFFUSE_MAP\n    uv.xy = u_DiffuseUVSet < 1 ? v_UVCoord1 : v_UVCoord2;\n    #ifdef HAS_DIFFUSE_UV_TRANSFORM\n    uv = u_DiffuseUVTransform * uv;\n    #endif\n#endif\n    return uv.xy;\n}\n\n// textures.glsl needs to be included\n\nconst float M_PI = 3.141592653589793;\nconst float c_MinReflectance = 0.04;\n\nFRAG_IN vec3 v_Position;\nFRAG_IN vec3 v_ModelViewPosition;\n\n#ifdef HAS_NORMALS\n#ifdef HAS_TANGENTS\nFRAG_IN mat3 v_TBN;\n#else\nFRAG_IN vec3 v_Normal;\n#endif\n#endif\n\n#ifdef HAS_VERTEX_COLOR_VEC3\nFRAG_IN vec3 v_Color;\n#endif\n#ifdef HAS_VERTEX_COLOR_VEC4\nFRAG_IN vec4 v_Color;\n#endif\n\nstruct AngularInfo\n{\n    float NdotL;                  // cos angle between normal and light direction\n    float NdotV;                  // cos angle between normal and view direction\n    float NdotH;                  // cos angle between normal and half vector\n    float LdotH;                  // cos angle between light direction and half vector\n\n    float VdotH;                  // cos angle between view direction and half vector\n\n    vec3 padding;\n};\n\nvec4 getVertexColor()\n{\n   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);\n\n#ifdef HAS_VERTEX_COLOR_VEC3\n    color.rgb = v_Color;\n#endif\n#ifdef HAS_VERTEX_COLOR_VEC4\n    color = v_Color;\n#endif\n\n   return color;\n}\n\n// Find the normal for this fragment, pulling either from a predefined normal map\n// or from the interpolated mesh normal and tangent attributes.\nvec3 getNormal()\n{\n    vec2 UV = getNormalUV();\n\n    // Retrieve the tangent space matrix\n#ifndef HAS_TANGENTS\n    vec3 pos_dx = _dFdx(v_Position);\n    vec3 pos_dy = _dFdy(v_Position);\n    vec3 tex_dx = _dFdx(vec3(UV, 0.0));\n    vec3 tex_dy = _dFdy(vec3(UV, 0.0));\n    vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);\n\n#ifdef HAS_NORMALS\n    vec3 ng = normalize(v_Normal);\n#else\n    vec3 ng = cross(pos_dx, pos_dy);\n#endif\n\n    t = normalize(t - ng * dot(ng, t));\n    vec3 b = normalize(cross(ng, t));\n    mat3 tbn = mat3(t, b, ng);\n#else // HAS_TANGENTS\n    mat3 tbn = v_TBN;\n#endif\n\n#ifdef HAS_NORMAL_MAP\n    vec3 n = _texture(u_NormalSampler, UV).rgb;\n    n = normalize(tbn * ((2.0 * n - 1.0) * vec3(u_NormalScale, u_NormalScale, 1.0)));\n#else\n    // The tbn matrix is linearly interpolated, so we need to re-normalize\n    vec3 n = normalize(tbn[2].xyz);\n#endif\n\n    return n;\n}\n\nfloat getPerceivedBrightness(vec3 vector)\n{\n    return sqrt(0.299 * vector.r * vector.r + 0.587 * vector.g * vector.g + 0.114 * vector.b * vector.b);\n}\n\n// https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness/examples/convert-between-workflows/js/three.pbrUtilities.js#L34\nfloat solveMetallic(vec3 diffuse, vec3 specular, float oneMinusSpecularStrength) {\n    float specularBrightness = getPerceivedBrightness(specular);\n\n    if (specularBrightness < c_MinReflectance) {\n        return 0.0;\n    }\n\n    float diffuseBrightness = getPerceivedBrightness(diffuse);\n\n    float a = c_MinReflectance;\n    float b = diffuseBrightness * oneMinusSpecularStrength / (1.0 - c_MinReflectance) + specularBrightness - 2.0 * c_MinReflectance;\n    float c = c_MinReflectance - specularBrightness;\n    float D = b * b - 4.0 * a * c;\n\n    return clamp((-b + sqrt(D)) / (2.0 * a), 0.0, 1.0);\n}\n\nAngularInfo getAngularInfo(vec3 pointToLight, vec3 normal, vec3 view)\n{\n    // Standard one-letter names\n    vec3 n = normalize(normal);           // Outward direction of surface point\n    vec3 v = normalize(view);             // Direction from surface point to view\n    vec3 l = normalize(pointToLight);     // Direction from surface point to light\n    vec3 h = normalize(l + v);            // Direction of the vector between l and v\n\n    float NdotL = clamp(dot(n, l), 0.0, 1.0);\n    float NdotV = clamp(dot(n, v), 0.0, 1.0);\n    float NdotH = clamp(dot(n, h), 0.0, 1.0);\n    float LdotH = clamp(dot(l, h), 0.0, 1.0);\n    float VdotH = clamp(dot(v, h), 0.0, 1.0);\n\n    return AngularInfo(\n        NdotL,\n        NdotV,\n        NdotH,\n        LdotH,\n        VdotH,\n        vec3(0, 0, 0)\n    );\n}\n\n#ifdef USE_SHADOW_MAPPING\nFRAG_IN vec4 v_PositionLightSpace;\n#endif\n\nfloat linstep(float low, float high, float v)\n{\n    return clamp((v-low) / (high-low), 0.0, 1.0);\n}\n\n#ifdef USE_SHADOW_MAPPING\nfloat getShadowContribution()\n{\n    vec3 coords = v_PositionLightSpace.xyz / v_PositionLightSpace.w * 0.5 + 0.5;\n    if (coords.z < 0.01 || coords.z > 0.99 || coords.x < 0.01 || coords.x > 0.99 || coords.y < 0.01 || coords.y > 0.99) {\n        return 1.0;\n    }\n    vec2 moments = vec2(1.0) - _texture(u_ShadowSampler, coords.xy).xy;\n    float p = step(coords.z, moments.x);\n    float variance = max(moments.y - moments.x * moments.x, 0.00002);\n    float d = coords.z - moments.x;\n    float pMax = linstep(0.2, 1.0, variance / (variance + d*d));\n    return min(max(p, pMax), 1.0);\n}\n#endif\nuniform float u_Exposure;\n\nconst float GAMMA = 2.2;\nconst float INV_GAMMA = 1.0 / GAMMA;\n\n// linear to sRGB approximation\n// see http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html\nvec3 LINEARtoSRGB(vec3 color)\n{\n    return pow(color, vec3(INV_GAMMA));\n}\n\n// sRGB to linear approximation\n// see http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html\nvec4 SRGBtoLINEAR(vec4 srgbIn)\n{\n    return vec4(pow(srgbIn.xyz, vec3(GAMMA)), srgbIn.w);\n}\n\n// Uncharted 2 tone map\n// see: http://filmicworlds.com/blog/filmic-tonemapping-operators/\nvec3 toneMapUncharted2Impl(vec3 color)\n{\n    const float A = 0.15;\n    const float B = 0.50;\n    const float C = 0.10;\n    const float D = 0.20;\n    const float E = 0.02;\n    const float F = 0.30;\n    return ((color*(A*color+C*B)+D*E)/(color*(A*color+B)+D*F))-E/F;\n}\n\nvec3 toneMapUncharted(vec3 color)\n{\n    const float W = 11.2;\n    color = toneMapUncharted2Impl(color * 2.0);\n    vec3 whiteScale = 1.0 / toneMapUncharted2Impl(vec3(W));\n    return LINEARtoSRGB(color * whiteScale);\n}\n\n// Hejl Richard tone map\n// see: http://filmicworlds.com/blog/filmic-tonemapping-operators/\nvec3 toneMapHejlRichard(vec3 color)\n{\n    color = max(vec3(0.0), color - vec3(0.004));\n    return (color*(6.2*color+.5))/(color*(6.2*color+1.7)+0.06);\n}\n\n// ACES tone map\n// see: https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/\nvec3 toneMapACES(vec3 color)\n{\n    const float A = 2.51;\n    const float B = 0.03;\n    const float C = 2.43;\n    const float D = 0.59;\n    const float E = 0.14;\n    return LINEARtoSRGB(clamp((color * (A * color + B)) / (color * (C * color + D) + E), 0.0, 1.0));\n}\n\nvec3 toneMap(vec3 color)\n{\n    color *= u_Exposure;\n\n#ifdef TONEMAP_UNCHARTED\n    return toneMapUncharted(color);\n#endif\n\n#ifdef TONEMAP_HEJLRICHARD\n    return toneMapHejlRichard(color);\n#endif\n\n#ifdef TONEMAP_ACES\n    return toneMapACES(color);\n#endif\n\n    return LINEARtoSRGB(color);\n}\n\nvec4 encodeRGBE(vec3 rgb) {\n  vec4 vEncoded;\n  float maxComponent = max(max(rgb.r, rgb.g), rgb.b);\n  float fExp = ceil(log2(maxComponent));\n  vEncoded.rgb = rgb / exp2(fExp);\n  vEncoded.a = (fExp + 128.0) / 255.0;\n  return vEncoded;\n}\n\nvec3 decodeRGBE(vec4 rgbe) {\n  vec3 vDecoded;\n  float fExp = rgbe.a * 255.0 - 128.0;\n  vDecoded = rgbe.rgb * exp2(fExp);\n  return vDecoded;\n}\n\n// KHR_lights_punctual extension.\n// see https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual\n\nstruct Light\n{\n    vec3 direction;\n    float range;\n\n    vec3 color;\n    float intensity;\n\n    vec3 position;\n    float innerConeCos;\n\n    float outerConeCos;\n    int type;\n\n    vec2 padding;\n};\n\nconst int LightType_Directional = 0;\nconst int LightType_Point = 1;\nconst int LightType_Spot = 2;\n\n#ifdef USE_PUNCTUAL\nuniform Light u_Lights[LIGHT_COUNT];\n#endif\n\n#ifdef USE_FOG\nuniform float u_FogNear;\nuniform float u_FogFar;\nuniform vec3 u_FogColor;\n#endif\n\n#if defined(MATERIAL_SPECULARGLOSSINESS) || defined(MATERIAL_METALLICROUGHNESS)\nuniform float u_MetallicFactor;\nuniform float u_RoughnessFactor;\nuniform vec4 u_BaseColorFactor;\n#endif\n\n#ifdef USE_INSTANCING\nFRAG_IN vec4 v_BaseColorFactor;\n#endif\n\n#ifdef MATERIAL_SPECULARGLOSSINESS\nuniform vec3 u_SpecularFactor;\nuniform vec4 u_DiffuseFactor;\nuniform float u_GlossinessFactor;\n#endif\n\n#ifdef ALPHAMODE_MASK\nuniform float u_AlphaCutoff;\n#endif\n\n#ifdef USE_SHADOW_MAPPING\nuniform int u_ShadowLightIndex;\n#endif\n\nuniform vec3 u_Camera;\n\nuniform int u_MipCount;\n\nstruct MaterialInfo\n{\n    float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)\n    vec3 reflectance0;            // full reflectance color (normal incidence angle)\n\n    float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])\n    vec3 diffuseColor;            // color contribution from diffuse lighting\n\n    vec3 reflectance90;           // reflectance color at grazing angle\n    vec3 specularColor;           // color contribution from specular lighting\n};\n\n// Calculation of the lighting contribution from an optional Image Based Light source.\n// Precomputed Environment Maps are required uniform inputs and are computed as outlined in [1].\n// See our README.md on Environment Maps [3] for additional discussion.\n#ifdef USE_IBL\nvec3 getIBLContribution(MaterialInfo materialInfo, vec3 n, vec3 v)\n{\n    float NdotV = clamp(dot(n, v), 0.0, 1.0);\n\n    float lod = clamp(materialInfo.perceptualRoughness * float(u_MipCount), 0.0, float(u_MipCount));\n    vec3 reflection = normalize(reflect(-v, n));\n\n    vec2 brdfSamplePoint = clamp(vec2(NdotV, materialInfo.perceptualRoughness), vec2(0.0, 0.0), vec2(1.0, 1.0));\n    // retrieve a scale and bias to F0. See [1], Figure 3\n    vec2 brdf = _texture(u_brdfLUT, brdfSamplePoint).rg;\n\n    vec4 diffuseSample = _texture(u_DiffuseEnvSampler, n);\n\n#ifdef USE_TEX_LOD\n    vec4 specularSample = _textureLod(u_SpecularEnvSampler, reflection, lod);\n#else\n    vec4 specularSample = _texture(u_SpecularEnvSampler, reflection);\n#endif\n\n#if defined(USE_HDR)\n    // Already linear.\n    vec3 diffuseLight = diffuseSample.rgb;\n    vec3 specularLight = specularSample.rgb;\n#elif defined(USE_RGBE)\n    vec3 diffuseLight = decodeRGBE(diffuseSample);\n    vec3 specularLight = decodeRGBE(specularSample);\n#else\n    vec3 diffuseLight = SRGBtoLINEAR(diffuseSample).rgb;\n    vec3 specularLight = SRGBtoLINEAR(specularSample).rgb;\n#endif\n\n    vec3 diffuse = diffuseLight * materialInfo.diffuseColor;\n    vec3 specular = specularLight * (materialInfo.specularColor * brdf.x + brdf.y);\n\n    return diffuse + specular;\n}\n#endif\n\n// Lambert lighting\n// see https://seblagarde.wordpress.com/2012/01/08/pi-or-not-to-pi-in-game-lighting-equation/\nvec3 diffuse(MaterialInfo materialInfo)\n{\n    return materialInfo.diffuseColor / M_PI;\n}\n\n// The following equation models the Fresnel reflectance term of the spec equation (aka F())\n// Implementation of fresnel from [4], Equation 15\nvec3 specularReflection(MaterialInfo materialInfo, AngularInfo angularInfo)\n{\n    return materialInfo.reflectance0 + (materialInfo.reflectance90 - materialInfo.reflectance0) * pow(clamp(1.0 - angularInfo.VdotH, 0.0, 1.0), 5.0);\n}\n\n// Smith Joint GGX\n// Note: Vis = G / (4 * NdotL * NdotV)\n// see Eric Heitz. 2014. Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs. Journal of Computer Graphics Techniques, 3\n// see Real-Time Rendering. Page 331 to 336.\n// see https://google.github.io/filament/Filament.md.html#materialsystem/specularbrdf/geometricshadowing(specularg)\nfloat visibilityOcclusion(MaterialInfo materialInfo, AngularInfo angularInfo)\n{\n    float NdotL = angularInfo.NdotL;\n    float NdotV = angularInfo.NdotV;\n    float alphaRoughnessSq = materialInfo.alphaRoughness * materialInfo.alphaRoughness;\n\n    float GGXV = NdotL * sqrt(NdotV * NdotV * (1.0 - alphaRoughnessSq) + alphaRoughnessSq);\n    float GGXL = NdotV * sqrt(NdotL * NdotL * (1.0 - alphaRoughnessSq) + alphaRoughnessSq);\n\n    float GGX = GGXV + GGXL;\n    if (GGX > 0.0)\n    {\n        return 0.5 / GGX;\n    }\n    return 0.0;\n}\n\n// The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())\n// Implementation from \"Average Irregularity Representation of a Roughened Surface for Ray Reflection\" by T. S. Trowbridge, and K. P. Reitz\n// Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.\nfloat microfacetDistribution(MaterialInfo materialInfo, AngularInfo angularInfo)\n{\n    float alphaRoughnessSq = materialInfo.alphaRoughness * materialInfo.alphaRoughness;\n    float f = (angularInfo.NdotH * alphaRoughnessSq - angularInfo.NdotH) * angularInfo.NdotH + 1.0;\n    return alphaRoughnessSq / (M_PI * f * f);\n}\n\nvec3 getPointShade(vec3 pointToLight, MaterialInfo materialInfo, vec3 normal, vec3 view)\n{\n    AngularInfo angularInfo = getAngularInfo(pointToLight, normal, view);\n\n    if (angularInfo.NdotL > 0.0 || angularInfo.NdotV > 0.0)\n    {\n        // Calculate the shading terms for the microfacet specular shading model\n        vec3 F = specularReflection(materialInfo, angularInfo);\n        float Vis = visibilityOcclusion(materialInfo, angularInfo);\n        float D = microfacetDistribution(materialInfo, angularInfo);\n\n        // Calculation of analytical lighting contribution\n        vec3 diffuseContrib = (1.0 - F) * diffuse(materialInfo);\n        vec3 specContrib = F * Vis * D;\n\n        // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)\n        return angularInfo.NdotL * (diffuseContrib + specContrib);\n    }\n\n    return vec3(0.0, 0.0, 0.0);\n}\n\n// https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual/README.md#range-property\nfloat getRangeAttenuation(float range, float distance)\n{\n    if (range <= 0.0)\n    {\n        // negative range means unlimited\n        return 1.0;\n    }\n    return max(min(1.0 - pow(distance / range, 4.0), 1.0), 0.0) / pow(distance, 2.0);\n}\n\n// https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual/README.md#inner-and-outer-cone-angles\nfloat getSpotAttenuation(vec3 pointToLight, vec3 spotDirection, float outerConeCos, float innerConeCos)\n{\n    float actualCos = dot(normalize(spotDirection), normalize(-pointToLight));\n    if (actualCos > outerConeCos)\n    {\n        if (actualCos < innerConeCos)\n        {\n            return smoothstep(outerConeCos, innerConeCos, actualCos);\n        }\n        return 1.0;\n    }\n    return 0.0;\n}\n\nvec3 applyDirectionalLight(Light light, MaterialInfo materialInfo, vec3 normal, vec3 view, float shadow)\n{\n    vec3 pointToLight = -light.direction;\n    vec3 shade = getPointShade(pointToLight, materialInfo, normal, view) * shadow;\n    return light.intensity * light.color * shade;\n}\n\nvec3 applyPointLight(Light light, MaterialInfo materialInfo, vec3 normal, vec3 view)\n{\n    vec3 pointToLight = light.position - v_Position;\n    float distance = length(pointToLight);\n    float attenuation = getRangeAttenuation(light.range, distance);\n    vec3 shade = getPointShade(pointToLight, materialInfo, normal, view);\n    return attenuation * light.intensity * light.color * shade;\n}\n\nvec3 applySpotLight(Light light, MaterialInfo materialInfo, vec3 normal, vec3 view, float shadow)\n{\n    vec3 pointToLight = light.position - v_Position;\n    float distance = length(pointToLight);\n    float rangeAttenuation = getRangeAttenuation(light.range, distance);\n    float spotAttenuation = getSpotAttenuation(pointToLight, light.direction, light.outerConeCos, light.innerConeCos);\n    vec3 shade = getPointShade(pointToLight, materialInfo, normal, view) * shadow;\n    return rangeAttenuation * spotAttenuation * light.intensity * light.color * shade;\n}\n\n#ifdef WEBGL2\n    out vec4 FRAG_COLOR;\n#endif\n\nvoid main()\n{\n    // Metallic and Roughness material properties are packed together\n    // In glTF, these factors can be specified by fixed scalar values\n    // or from a metallic-roughness map\n    float perceptualRoughness = 0.0;\n    float metallic = 0.0;\n    vec4 baseColor = vec4(0.0, 0.0, 0.0, 1.0);\n    vec3 diffuseColor = vec3(0.0);\n    vec3 specularColor= vec3(0.0);\n    vec3 f0 = vec3(0.04);\n\n#ifdef MATERIAL_SPECULARGLOSSINESS\n\n#ifdef HAS_SPECULAR_GLOSSINESS_MAP\n    vec4 sgSample = SRGBtoLINEAR(_texture(u_SpecularGlossinessSampler, getSpecularGlossinessUV()));\n    perceptualRoughness = (1.0 - sgSample.a * u_GlossinessFactor); // glossiness to roughness\n    f0 = sgSample.rgb * u_SpecularFactor; // specular\n#else\n    f0 = u_SpecularFactor;\n    perceptualRoughness = 1.0 - u_GlossinessFactor;\n#endif // ! HAS_SPECULAR_GLOSSINESS_MAP\n\n#ifdef HAS_DIFFUSE_MAP\n    baseColor = SRGBtoLINEAR(_texture(u_DiffuseSampler, getDiffuseUV())) * u_DiffuseFactor;\n#else\n    baseColor = u_DiffuseFactor;\n#endif // !HAS_DIFFUSE_MAP\n\n    baseColor *= getVertexColor();\n\n    // f0 = specular\n    specularColor = f0;\n    float oneMinusSpecularStrength = 1.0 - max(max(f0.r, f0.g), f0.b);\n    diffuseColor = baseColor.rgb * oneMinusSpecularStrength;\n\n#ifdef DEBUG_METALLIC\n    // do conversion between metallic M-R and S-G metallic\n    metallic = solveMetallic(baseColor.rgb, specularColor, oneMinusSpecularStrength);\n#endif // ! DEBUG_METALLIC\n\n#endif // ! MATERIAL_SPECULARGLOSSINESS\n\n#ifdef MATERIAL_METALLICROUGHNESS\n\n#ifdef HAS_METALLIC_ROUGHNESS_MAP\n    // Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.\n    // This layout intentionally reserves the 'r' channel for (optional) occlusion map data\n    vec4 mrSample = _texture(u_MetallicRoughnessSampler, getMetallicRoughnessUV());\n    perceptualRoughness = mrSample.g * u_RoughnessFactor;\n    metallic = mrSample.b * u_MetallicFactor;\n#else\n    metallic = u_MetallicFactor;\n    perceptualRoughness = u_RoughnessFactor;\n#endif\n\n    vec4 baseColorFactor = u_BaseColorFactor;\n#ifdef USE_INSTANCING\n    baseColorFactor = v_BaseColorFactor;\n#endif\n\n    // The albedo may be defined from a base texture or a flat color\n#if defined(HAS_BASE_COLOR_MAP) && defined(MATERIAL_UNLIT)\n    baseColor = _texture(u_BaseColorSampler, getBaseColorUV()) * baseColorFactor;\n#elif defined(HAS_BASE_COLOR_MAP)\n    baseColor = SRGBtoLINEAR(_texture(u_BaseColorSampler, getBaseColorUV())) * baseColorFactor;\n#else\n    baseColor = baseColorFactor;\n#endif\n\n    baseColor *= getVertexColor();\n\n    diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);\n\n    specularColor = mix(f0, baseColor.rgb, metallic);\n\n#endif // ! MATERIAL_METALLICROUGHNESS\n\n#ifdef ALPHAMODE_MASK\n    if(baseColor.a < u_AlphaCutoff)\n    {\n        discard;\n    }\n    baseColor.a = 1.0;\n#endif\n\n#ifdef ALPHAMODE_OPAQUE\n    baseColor.a = 1.0;\n#endif\n\n#ifdef MATERIAL_UNLIT\n    FRAG_COLOR = vec4(baseColor.rgb * baseColor.a, baseColor.a);\n    return;\n#endif\n\n    perceptualRoughness = clamp(perceptualRoughness, 0.0, 1.0);\n    metallic = clamp(metallic, 0.0, 1.0);\n\n    // Roughness is authored as perceptual roughness; as is convention,\n    // convert to material roughness by squaring the perceptual roughness [2].\n    float alphaRoughness = perceptualRoughness * perceptualRoughness;\n\n    // Compute reflectance.\n    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);\n\n    vec3 specularEnvironmentR0 = specularColor.rgb;\n    // Anything less than 2% is physically impossible and is instead considered to be shadowing. Compare to \"Real-Time-Rendering\" 4th editon on page 325.\n    vec3 specularEnvironmentR90 = vec3(clamp(reflectance * 50.0, 0.0, 1.0));\n\n    MaterialInfo materialInfo = MaterialInfo(\n        perceptualRoughness,\n        specularEnvironmentR0,\n        alphaRoughness,\n        diffuseColor,\n        specularEnvironmentR90,\n        specularColor\n    );\n\n    // LIGHTING\n\n    vec3 color = vec3(0.0, 0.0, 0.0);\n    vec3 normal = getNormal();\n    vec3 view = normalize(u_Camera - v_Position);\n\n    float shadow = 1.0;\n    #ifdef USE_SHADOW_MAPPING\n        shadow = getShadowContribution();\n    #endif\n\n#ifdef USE_PUNCTUAL\n    for (int i = 0; i < LIGHT_COUNT; ++i)\n    {\n        float shadowContribution = shadow;\n        #ifdef USE_SHADOW_MAPPING\n        if (u_ShadowLightIndex != i) \n        {\n            shadowContribution = 1.0;\n        }\n        #endif\n        Light light = u_Lights[i];\n        if (light.type == LightType_Directional)\n        {\n            color += applyDirectionalLight(light, materialInfo, normal, view, shadowContribution);\n        }\n        else if (light.type == LightType_Point)\n        {\n            color += applyPointLight(light, materialInfo, normal, view);\n        }\n        else if (light.type == LightType_Spot)\n        {\n            color += applySpotLight(light, materialInfo, normal, view, shadowContribution);\n        }\n    }\n#endif\n\n    // Calculate lighting contribution from image based lighting source (IBL)\n#ifdef USE_IBL\n    color += getIBLContribution(materialInfo, normal, view);\n#endif\n\n    float ao = 1.0;\n    // Apply optional PBR terms for additional (optional) shading\n#ifdef HAS_OCCLUSION_MAP\n    ao = _texture(u_OcclusionSampler,  getOcclusionUV()).r;\n    color = mix(color, color * ao, u_OcclusionStrength);\n#endif\n\n    vec3 emissive = vec3(0);\n#ifdef HAS_EMISSIVE_MAP\n    emissive = SRGBtoLINEAR(_texture(u_EmissiveSampler, getEmissiveUV())).rgb * u_EmissiveFactor;\n    color += emissive;\n#endif\n\n#ifndef DEBUG_OUTPUT // no debug\n\n    vec3 toneMappedColor = toneMap(color);\n\n    #ifdef USE_FOG\n        float fogDepth = -v_ModelViewPosition.z;\n        float fogFactor = smoothstep(u_FogNear, u_FogFar, fogDepth);\n        toneMappedColor = mix(toneMappedColor, u_FogColor, fogFactor);\n    #endif\n\n    // regular shading\n    FRAG_COLOR = vec4(toneMappedColor * baseColor.a, baseColor.a);\n\n#else // debug output\n\n    #ifdef DEBUG_METALLIC\n        FRAG_COLOR.rgb = vec3(metallic);\n    #endif\n\n    #ifdef DEBUG_ROUGHNESS\n        FRAG_COLOR.rgb = vec3(perceptualRoughness);\n    #endif\n\n    #ifdef DEBUG_NORMAL\n        #ifdef HAS_NORMAL_MAP\n            FRAG_COLOR.rgb = _texture(u_NormalSampler, getNormalUV()).rgb;\n        #else\n            FRAG_COLOR.rgb = vec3(0.5, 0.5, 1.0);\n        #endif\n    #endif\n\n    #ifdef DEBUG_BASECOLOR\n        FRAG_COLOR.rgb = LINEARtoSRGB(baseColor.rgb);\n    #endif\n\n    #ifdef DEBUG_OCCLUSION\n        FRAG_COLOR.rgb = vec3(ao);\n    #endif\n\n    #ifdef DEBUG_EMISSIVE\n        FRAG_COLOR.rgb = LINEARtoSRGB(emissive);\n    #endif\n\n    #ifdef DEBUG_F0\n        FRAG_COLOR.rgb = vec3(f0);\n    #endif\n\n    #ifdef DEBUG_ALPHA\n        FRAG_COLOR.rgb = vec3(baseColor.a);\n    #endif\n\n    FRAG_COLOR.a = 1.0;\n\n#endif // !DEBUG_OUTPUT\n}\n"};

  var Shader$a = {"source":"#version VERSION\n\n#define FEATURES\n\nvec4 _texture(sampler2D sampler, vec2 coord)\n{\n#ifdef WEBGL2\n    return texture(sampler, coord);\n#else\n    return texture2D(sampler, coord);\n#endif\n}\n\nvec4 _texture(samplerCube sampler, vec3 coord)\n{\n#ifdef WEBGL2\n    return texture(sampler, coord);\n#else\n    return textureCube(sampler, coord);\n#endif\n}\n#ifdef HAS_TARGET_POSITION0\nVERT_IN vec3 a_Target_Position0;\n#endif\n\n#ifdef HAS_TARGET_POSITION1\nVERT_IN vec3 a_Target_Position1;\n#endif\n\n#ifdef HAS_TARGET_POSITION2\nVERT_IN vec3 a_Target_Position2;\n#endif\n\n#ifdef HAS_TARGET_POSITION3\nVERT_IN vec3 a_Target_Position3;\n#endif\n\n#ifdef HAS_TARGET_POSITION4\nVERT_IN vec3 a_Target_Position4;\n#endif\n\n#ifdef HAS_TARGET_POSITION5\nVERT_IN vec3 a_Target_Position5;\n#endif\n\n#ifdef HAS_TARGET_POSITION6\nVERT_IN vec3 a_Target_Position6;\n#endif\n\n#ifdef HAS_TARGET_POSITION7\nVERT_IN vec3 a_Target_Position7;\n#endif\n\n#ifdef HAS_TARGET_NORMAL0\nVERT_IN vec3 a_Target_Normal0;\n#endif\n\n#ifdef HAS_TARGET_NORMAL1\nVERT_IN vec3 a_Target_Normal1;\n#endif\n\n#ifdef HAS_TARGET_NORMAL2\nVERT_IN vec3 a_Target_Normal2;\n#endif\n\n#ifdef HAS_TARGET_NORMAL3\nVERT_IN vec3 a_Target_Normal3;\n#endif\n\n#ifdef HAS_TARGET_TANGENT0\nVERT_IN vec3 a_Target_Tangent0;\n#endif\n\n#ifdef HAS_TARGET_TANGENT1\nVERT_IN vec3 a_Target_Tangent1;\n#endif\n\n#ifdef HAS_TARGET_TANGENT2\nVERT_IN vec3 a_Target_Tangent2;\n#endif\n\n#ifdef HAS_TARGET_TANGENT3\nVERT_IN vec3 a_Target_Tangent3;\n#endif\n\n#ifdef USE_MORPHING\nuniform float u_morphWeights[WEIGHT_COUNT];\n#endif\n\n#ifdef HAS_JOINT_SET1\nVERT_IN vec4 a_Joint1;\n#endif\n\n#ifdef HAS_JOINT_SET2\nVERT_IN vec4 a_Joint2;\n#endif\n\n#ifdef HAS_WEIGHT_SET1\nVERT_IN vec4 a_Weight1;\n#endif\n\n#ifdef HAS_WEIGHT_SET2\nVERT_IN vec4 a_Weight2;\n#endif\n\n#ifdef USE_SKINNING\n#ifdef USE_SKINNING_TEXTURE\nuniform sampler2D u_jointMatrixSampler;\nuniform sampler2D u_jointNormalMatrixSampler;\n#else\nuniform mat4 u_jointMatrix[JOINT_COUNT];\nuniform mat4 u_jointNormalMatrix[JOINT_COUNT];\n#endif\n#endif\n\n// these offsets assume the texture is 4 pixels across\n#define ROW0_U ((0.5 + 0.0) / 4.0)\n#define ROW1_U ((0.5 + 1.0) / 4.0)\n#define ROW2_U ((0.5 + 2.0) / 4.0)\n#define ROW3_U ((0.5 + 3.0) / 4.0)\n\n#ifdef USE_SKINNING\nmat4 getJointMatrix(float boneNdx) {\n    #ifdef USE_SKINNING_TEXTURE\n    float v = (boneNdx + 0.5) / float(JOINT_COUNT);\n    return mat4(\n        _texture(u_jointMatrixSampler, vec2(ROW0_U, v)),\n        _texture(u_jointMatrixSampler, vec2(ROW1_U, v)),\n        _texture(u_jointMatrixSampler, vec2(ROW2_U, v)),\n        _texture(u_jointMatrixSampler, vec2(ROW3_U, v))\n    );\n    #else\n    return u_jointMatrix[int(boneNdx)];\n    #endif\n}\n\nmat4 getJointNormalMatrix(float boneNdx) {\n    #ifdef USE_SKINNING_TEXTURE\n    float v = (boneNdx + 0.5) / float(JOINT_COUNT);\n    return mat4(\n        _texture(u_jointNormalMatrixSampler, vec2(ROW0_U, v)),\n        _texture(u_jointNormalMatrixSampler, vec2(ROW1_U, v)),\n        _texture(u_jointNormalMatrixSampler, vec2(ROW2_U, v)),\n        _texture(u_jointNormalMatrixSampler, vec2(ROW3_U, v))\n    );\n    #else\n    return u_jointNormalMatrix[int(boneNdx)];\n    #endif\n}\n\nmat4 getSkinningMatrix()\n{\n    mat4 skin = mat4(0);\n\n    #if defined(HAS_WEIGHT_SET1) && defined(HAS_JOINT_SET1)\n    skin +=\n        a_Weight1.x * getJointMatrix(a_Joint1.x) +\n        a_Weight1.y * getJointMatrix(a_Joint1.y) +\n        a_Weight1.z * getJointMatrix(a_Joint1.z) +\n        a_Weight1.w * getJointMatrix(a_Joint1.w);\n    #endif\n\n    return skin;\n}\n\nmat4 getSkinningNormalMatrix()\n{\n    mat4 skin = mat4(0);\n\n    #if defined(HAS_WEIGHT_SET1) && defined(HAS_JOINT_SET1)\n    skin +=\n        a_Weight1.x * getJointNormalMatrix(a_Joint1.x) +\n        a_Weight1.y * getJointNormalMatrix(a_Joint1.y) +\n        a_Weight1.z * getJointNormalMatrix(a_Joint1.z) +\n        a_Weight1.w * getJointNormalMatrix(a_Joint1.w);\n    #endif\n\n    return skin;\n}\n#endif // !USE_SKINNING\n\n#ifdef USE_MORPHING\nvec4 getTargetPosition()\n{\n    vec4 pos = vec4(0);\n\n#ifdef HAS_TARGET_POSITION0\n    pos.xyz += u_morphWeights[0] * a_Target_Position0;\n#endif\n\n#ifdef HAS_TARGET_POSITION1\n    pos.xyz += u_morphWeights[1] * a_Target_Position1;\n#endif\n\n#ifdef HAS_TARGET_POSITION2\n    pos.xyz += u_morphWeights[2] * a_Target_Position2;\n#endif\n\n#ifdef HAS_TARGET_POSITION3\n    pos.xyz += u_morphWeights[3] * a_Target_Position3;\n#endif\n\n#ifdef HAS_TARGET_POSITION4\n    pos.xyz += u_morphWeights[4] * a_Target_Position4;\n#endif\n\n    return pos;\n}\n\nvec4 getTargetNormal()\n{\n    vec4 normal = vec4(0);\n\n#ifdef HAS_TARGET_NORMAL0\n    normal.xyz += u_morphWeights[0] * a_Target_Normal0;\n#endif\n\n#ifdef HAS_TARGET_NORMAL1\n    normal.xyz += u_morphWeights[1] * a_Target_Normal1;\n#endif\n\n#ifdef HAS_TARGET_NORMAL2\n    normal.xyz += u_morphWeights[2] * a_Target_Normal2;\n#endif\n\n#ifdef HAS_TARGET_NORMAL3\n    normal.xyz += u_morphWeights[3] * a_Target_Normal3;\n#endif\n\n#ifdef HAS_TARGET_NORMAL4\n    normal.xyz += u_morphWeights[4] * a_Target_Normal4;\n#endif\n\n    return normal;\n}\n\nvec4 getTargetTangent()\n{\n    vec4 tangent = vec4(0);\n\n#ifdef HAS_TARGET_TANGENT0\n    tangent.xyz += u_morphWeights[0] * a_Target_Tangent0;\n#endif\n\n#ifdef HAS_TARGET_TANGENT1\n    tangent.xyz += u_morphWeights[1] * a_Target_Tangent1;\n#endif\n\n#ifdef HAS_TARGET_TANGENT2\n    tangent.xyz += u_morphWeights[2] * a_Target_Tangent2;\n#endif\n\n#ifdef HAS_TARGET_TANGENT3\n    tangent.xyz += u_morphWeights[3] * a_Target_Tangent3;\n#endif\n\n#ifdef HAS_TARGET_TANGENT4\n    tangent.xyz += u_morphWeights[4] * a_Target_Tangent4;\n#endif\n\n    return tangent;\n}\n\n#endif // !USE_MORPHING\n\n\nVERT_IN vec4 a_Position;\nVERT_OUT vec3 v_Position;\n\nVERT_OUT vec3 v_ModelViewPosition;\n\n#ifdef USE_INSTANCING\nVERT_IN vec4 a_ModelMatrix0;\nVERT_IN vec4 a_ModelMatrix1;\nVERT_IN vec4 a_ModelMatrix2;\nVERT_IN vec4 a_ModelMatrix3;\n#endif\n\n#ifdef USE_INSTANCING\nVERT_IN vec4 a_BaseColorFactor;\nVERT_OUT vec4 v_BaseColorFactor;\n#endif\n\n#ifdef USE_INSTANCING\nVERT_IN vec4 a_NormalMatrix0;\nVERT_IN vec4 a_NormalMatrix1;\nVERT_IN vec4 a_NormalMatrix2;\nVERT_IN vec4 a_NormalMatrix3;\n#endif\n\n#ifdef HAS_NORMALS\nVERT_IN vec4 a_Normal;\n#endif\n\n#ifdef HAS_TANGENTS\nVERT_IN vec4 a_Tangent;\n#endif\n\n#ifdef HAS_NORMALS\n#ifdef HAS_TANGENTS\nVERT_OUT mat3 v_TBN;\n#else\nVERT_OUT vec3 v_Normal;\n#endif\n#endif\n\n#ifdef HAS_UV_SET1\nVERT_IN vec2 a_UV1;\n#endif\n\n#ifdef HAS_UV_SET2\nVERT_IN vec2 a_UV2;\n#endif\n\nVERT_OUT vec2 v_UVCoord1;\nVERT_OUT vec2 v_UVCoord2;\n\n#ifdef HAS_VERTEX_COLOR_VEC3\nVERT_IN vec3 a_Color;\nVERT_OUT vec3 v_Color;\n#endif\n\n#ifdef HAS_VERTEX_COLOR_VEC4\nVERT_IN vec4 a_Color;\nVERT_OUT vec4 v_Color;\n#endif\n\nuniform mat4 u_ViewProjectionMatrix;\nuniform mat4 u_ModelMatrix;\nuniform mat4 u_ViewMatrix;\nuniform mat4 u_NormalMatrix;\n\n#ifdef USE_SHADOW_MAPPING\nuniform mat4 u_LightViewProjectionMatrix;\nVERT_OUT vec4 v_PositionLightSpace;\n#endif\n\nvec4 getPosition()\n{\n    vec4 pos = a_Position;\n\n#ifdef USE_MORPHING\n    pos += getTargetPosition();\n#endif\n\n#ifdef USE_SKINNING\n    pos = getSkinningMatrix() * pos;\n#endif\n\n    return pos;\n}\n\n#ifdef HAS_NORMALS\nvec4 getNormal()\n{\n    vec4 normal = a_Normal;\n\n#ifdef USE_MORPHING\n    normal += getTargetNormal();\n#endif\n\n#ifdef USE_SKINNING\n    normal = getSkinningNormalMatrix() * normal;\n#endif\n\n    return normalize(normal);\n}\n#endif\n\n#ifdef HAS_TANGENTS\nvec4 getTangent()\n{\n    vec4 tangent = a_Tangent;\n\n#ifdef USE_MORPHING\n    tangent += getTargetTangent();\n#endif\n\n#ifdef USE_SKINNING\n    tangent = getSkinningMatrix() * tangent;\n#endif\n\n    return normalize(tangent);\n}\n#endif\n\nvoid main()\n{\n    mat4 modelMatrix = u_ModelMatrix;\n    #ifdef USE_INSTANCING\n        modelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\n    #endif\n    vec4 pos = modelMatrix * getPosition();\n    v_Position = vec3(pos.xyz) / pos.w;\n\n    vec4 modelViewPosition = u_ViewMatrix * pos;\n    v_ModelViewPosition = vec3(modelViewPosition.xyz) / modelViewPosition.w;\n\n    mat4 normalMatrix = u_NormalMatrix;\n    #ifdef USE_INSTANCING\n        normalMatrix = mat4(a_NormalMatrix0, a_NormalMatrix1, a_NormalMatrix2, a_NormalMatrix3);\n    #endif\n\n    #ifdef HAS_NORMALS\n    #ifdef HAS_TANGENTS\n    vec4 tangent = getTangent();\n    vec3 normalW = normalize(vec3(normalMatrix * vec4(getNormal().xyz, 0.0)));\n    vec3 tangentW = normalize(vec3(modelMatrix * vec4(tangent.xyz, 0.0)));\n    vec3 bitangentW = cross(normalW, tangentW) * tangent.w;\n    v_TBN = mat3(tangentW, bitangentW, normalW);\n    #else // !HAS_TANGENTS\n    v_Normal = normalize(vec3(normalMatrix * vec4(getNormal().xyz, 0.0)));\n    #endif\n    #endif // !HAS_NORMALS\n\n    v_UVCoord1 = vec2(0.0, 0.0);\n    v_UVCoord2 = vec2(0.0, 0.0);\n\n    #ifdef HAS_UV_SET1\n    v_UVCoord1 = a_UV1;\n    #endif\n\n    #ifdef HAS_UV_SET2\n    v_UVCoord2 = a_UV2;\n    #endif\n\n    #if defined(HAS_VERTEX_COLOR_VEC3) || defined(HAS_VERTEX_COLOR_VEC4)\n    v_Color = a_Color;\n    #endif\n\n    #ifdef USE_SHADOW_MAPPING\n    v_PositionLightSpace = u_LightViewProjectionMatrix * pos;\n    #endif\n\n    #ifdef USE_INSTANCING\n    v_BaseColorFactor = a_BaseColorFactor;\n    #endif\n\n    gl_Position = u_ViewProjectionMatrix * pos;\n}\n"};

  class StandardShader extends MeshShader {
    constructor() {
      super(...arguments);
      this._instancing = new StandardShaderInstancing();
    }
    static build(renderer, features) {
      let program = PixiCore.Program.from(
        StandardShaderSource.build(Shader$a.source, features, renderer),
        StandardShaderSource.build(Shader$b.source, features, renderer)
      );
      return new StandardShader(program);
    }
    get name() {
      return "standard-shader";
    }
    createShaderGeometry(geometry, instanced) {
      let result = super.createShaderGeometry(geometry, instanced);
      if (instanced) {
        this._instancing.addGeometryAttributes(result);
      }
      if (geometry.targets) {
        for (let i = 0; i < geometry.targets.length; i++) {
          let positions = geometry.targets[i].positions;
          if (positions) {
            result.addAttribute(
              `a_Target_Position${i}`,
              new PixiCore.Buffer(positions.buffer),
              3,
              positions.normalized,
              positions.componentType,
              positions.stride
            );
          }
          let normals = geometry.targets[i].normals;
          if (normals) {
            result.addAttribute(
              `a_Target_Normal${i}`,
              new PixiCore.Buffer(normals.buffer),
              3,
              normals.normalized,
              normals.componentType,
              normals.stride
            );
          }
          let tangents = geometry.targets[i].tangents;
          if (tangents) {
            result.addAttribute(
              `a_Target_Tangent${i}`,
              new PixiCore.Buffer(tangents.buffer),
              3,
              tangents.normalized,
              tangents.componentType,
              tangents.stride
            );
          }
        }
      }
      if (geometry.uvs && geometry.uvs[1]) {
        result.addAttribute(
          "a_UV2",
          new PixiCore.Buffer(geometry.uvs[1].buffer),
          2,
          geometry.uvs[1].normalized,
          geometry.uvs[1].componentType,
          geometry.uvs[1].stride
        );
      }
      if (geometry.joints) {
        result.addAttribute(
          "a_Joint1",
          new PixiCore.Buffer(geometry.joints.buffer),
          4,
          geometry.joints.normalized,
          geometry.joints.componentType,
          geometry.joints.stride
        );
      }
      if (geometry.weights) {
        result.addAttribute(
          "a_Weight1",
          new PixiCore.Buffer(geometry.weights.buffer),
          4,
          geometry.weights.normalized,
          geometry.weights.componentType,
          geometry.weights.stride
        );
      }
      return result;
    }
    render(mesh, renderer, state, drawMode) {
      if (mesh.instances.length > 0) {
        const filteredInstances = mesh.instances.filter((instance) => instance.worldVisible && instance.renderable);
        if (filteredInstances.length === 0) {
          return;
        }
        this._instancing.updateBuffers(filteredInstances);
      }
      super.render(mesh, renderer, state, drawMode);
    }
  }

  var MaterialRenderSortType = /* @__PURE__ */ ((MaterialRenderSortType2) => {
    MaterialRenderSortType2["opaque"] = "opaque";
    MaterialRenderSortType2["transparent"] = "transparent";
    return MaterialRenderSortType2;
  })(MaterialRenderSortType || {});

  class Material {
    constructor() {
      this._renderSortType = MaterialRenderSortType.opaque;
      this.state = Object.assign(new PixiCore.State(), {
        culling: true,
        clockwiseFrontFace: false,
        depthTest: true
      });
      this.drawMode = constants.DRAW_MODES.TRIANGLES;
      this.renderSortType = MaterialRenderSortType.opaque;
    }
    get depthMask() {
      return this.state.depthMask;
    }
    set depthMask(value) {
      this.state.depthMask = value;
    }
    get doubleSided() {
      return !this.state.culling;
    }
    set doubleSided(value) {
      this.state.culling = !value;
    }
    get blendMode() {
      return this.state.blendMode;
    }
    set blendMode(value) {
      this.state.blendMode = value;
    }
    createShader(mesh, renderer) {
      return void 0;
    }
    updateUniforms(mesh, shader) {
    }
    destroy() {
    }
    get isInstancingSupported() {
      return false;
    }
    createInstance() {
      return void 0;
    }
    render(mesh, renderer) {
      if (!this._shader) {
        this._shader = this.createShader(mesh, renderer);
        if (!this._shader) {
          return;
        }
      }
      if (this.updateUniforms) {
        this.updateUniforms(mesh, this._shader);
      }
      this._shader.render(mesh, renderer, this.state, this.drawMode);
    }
    static from(vertexSrc, fragmentSrc, updateUniforms) {
      return Object.assign(new Material(), {
        updateUniforms: updateUniforms || (() => {
        }),
        _shader: new MeshShader(PixiCore.Program.from(vertexSrc, fragmentSrc))
      });
    }
  }

  class LightingEnvironment {
    constructor(renderer, imageBasedLighting) {
      this.renderer = renderer;
      this.lights = [];
      this.renderer.on("prerender", () => {
        for (let light of this.lights) {
          if (!light.parent) {
            light.transform.updateTransform();
          }
        }
      });
      if (!LightingEnvironment.main) {
        LightingEnvironment.main = this;
      }
      this.imageBasedLighting = imageBasedLighting;
    }
    destroy() {
    }
    get valid() {
      return !this.imageBasedLighting || this.imageBasedLighting.valid;
    }
  }
  Compatibility.installRendererPlugin("lighting", LightingEnvironment);

  class StandardMaterialSkinUniforms {
    enableJointMatrixTextures(jointsCount) {
      if (!this._jointMatrixTexture) {
        this._jointMatrixTexture = new StandardMaterialMatrixTexture(jointsCount);
      }
      if (!this._jointNormalTexture) {
        this._jointNormalTexture = new StandardMaterialMatrixTexture(jointsCount);
      }
    }
    destroy() {
      var _a, _b;
      (_a = this._jointNormalTexture) == null ? void 0 : _a.destroy(true);
      (_b = this._jointMatrixTexture) == null ? void 0 : _b.destroy(true);
    }
    update(mesh, shader) {
      if (!mesh.skin) {
        return;
      }
      if (this._jointMatrixTexture) {
        this._jointMatrixTexture.updateBuffer(mesh.skin.jointMatrices);
        shader.uniforms.u_jointMatrixSampler = this._jointMatrixTexture;
      } else {
        shader.uniforms.u_jointMatrix = mesh.skin.jointMatrices;
      }
      if (this._jointNormalTexture) {
        this._jointNormalTexture.updateBuffer(mesh.skin.jointNormalMatrices);
        shader.uniforms.u_jointNormalMatrixSampler = this._jointNormalTexture;
      } else {
        shader.uniforms.u_jointNormalMatrix = mesh.skin.jointNormalMatrices;
      }
    }
  }

  class Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
      this._array4 = new Float32Array([r, g, b, a]);
      this._array3 = this._array4.subarray(0, 3);
    }
    static fromBytes(r = 0, g = 0, b = 0, a = 255) {
      return new Color(r / 255, g / 255, b / 255, a / 255);
    }
    static fromHex(hex) {
      if (typeof hex === "string") {
        hex = parseInt(hex.replace(/[^0-9A-F]/gi, ""), 16);
      }
      return Color.fromBytes(hex >> 16 & 255, hex >> 8 & 255, hex & 255);
    }
    get rgb() {
      return this._array3;
    }
    get rgba() {
      return this._array4;
    }
    get r() {
      return this._array4[0];
    }
    set r(value) {
      this._array4[0] = value;
    }
    get g() {
      return this._array4[1];
    }
    set g(value) {
      this._array4[1] = value;
    }
    get b() {
      return this._array4[2];
    }
    set b(value) {
      this._array4[2] = value;
    }
    get a() {
      return this._array4[3];
    }
    set a(value) {
      this._array4[3] = value;
    }
    static from(source) {
      return new Color(...source);
    }
  }

  class InstancedStandardMaterial {
    constructor(material) {
      this.baseColor = new Color(...material.baseColor.rgba);
    }
  }

  class glTFMaterial {
    constructor() {
      this.alphaCutoff = 0.5;
      this.alphaMode = "OPAQUE";
      this.doubleSided = false;
      this.roughness = 1;
      this.metallic = 1;
      this.emissiveFactor = [0, 0, 0];
      this.baseColor = [1, 1, 1, 1];
      this.unlit = false;
    }
  }

  class Mat3 {
    static multiply(a, b, out = new Float32Array(9)) {
      return multiply$2(out, a, b);
    }
  }

  class TextureTransform {
    constructor() {
      this._rotation = 0;
      this._array = new Float32Array(9);
      this._dirty = true;
      this._translation = new Float32Array([
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]);
      this._scaling = new Float32Array([
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]);
      this._rotate = new Float32Array([
        Math.cos(0),
        -Math.sin(0),
        0,
        Math.sin(0),
        Math.cos(0),
        0,
        0,
        0,
        1
      ]);
      this.offset = new math.ObservablePoint(() => {
        this._translation.set([
          1,
          0,
          0,
          0,
          1,
          0,
          this.offset.x,
          this.offset.y,
          1
        ]);
        this._dirty = true;
      }, void 0);
      this.scale = new math.ObservablePoint(() => {
        this._scaling.set([
          this.scale.x,
          0,
          0,
          0,
          this.scale.y,
          0,
          0,
          0,
          1
        ]);
        this._dirty = true;
      }, void 0, 1, 1);
    }
    get rotation() {
      return this._rotation;
    }
    set rotation(value) {
      this._rotation = value;
      this._rotate.set([
        Math.cos(value),
        -Math.sin(value),
        0,
        Math.sin(value),
        Math.cos(value),
        0,
        0,
        0,
        1
      ]);
      this._dirty = true;
    }
    get array() {
      if (this._dirty) {
        Mat3.multiply(
          Mat3.multiply(this._translation, this._rotate, this._array),
          this._scaling,
          this._array
        );
        this._dirty = false;
      }
      return this._array;
    }
    static fromTexture(texture) {
      const transform = new TextureTransform();
      if (!texture.frame || texture.noFrame) {
        return transform;
      }
      let { x, y, width, height } = texture.frame;
      if (texture.rotate === 0) {
        transform.offset.set(
          x / texture.baseTexture.width,
          y / texture.baseTexture.height
        );
        transform.scale.set(
          width / texture.baseTexture.width,
          height / texture.baseTexture.height
        );
      }
      if (texture.rotate === 2) {
        x = texture.frame.x + texture.frame.width;
        transform.offset.set(
          x / texture.baseTexture.width,
          y / texture.baseTexture.height
        );
        transform.scale.set(
          height / texture.baseTexture.height,
          width / texture.baseTexture.width
        );
        transform.rotation = -90 * math.DEG_TO_RAD;
      }
      return transform;
    }
  }

  class StandardMaterialTexture extends PixiCore.Texture {
    constructor(baseTexture, uvSet) {
      super(baseTexture);
      this.uvSet = uvSet;
    }
  }

  class StandardMaterialNormalTexture extends StandardMaterialTexture {
    constructor(baseTexture, scale, uvSet) {
      super(baseTexture, uvSet);
      this.scale = scale;
      this.uvSet = uvSet;
    }
  }

  class StandardMaterialOcclusionTexture extends StandardMaterialTexture {
    constructor(baseTexture, strength, uvSet) {
      super(baseTexture, uvSet);
      this.strength = strength;
      this.uvSet = uvSet;
    }
  }

  class StandardMaterialFactory {
    create(source) {
      let material = new StandardMaterial();
      if (!(source instanceof glTFMaterial)) {
        return material;
      }
      material.baseColor = Color.from(source.baseColor);
      if (source.baseColorTexture) {
        material.baseColorTexture = new StandardMaterialTexture(
          source.baseColorTexture.baseTexture,
          source.baseColorTexture.texCoord
        );
        material.baseColorTexture.transform = this.createTextureTransform(source.baseColorTexture);
      }
      material.metallic = source.metallic;
      material.roughness = source.roughness;
      if (source.metallicRoughnessTexture) {
        material.metallicRoughnessTexture = new StandardMaterialTexture(
          source.metallicRoughnessTexture.baseTexture,
          source.metallicRoughnessTexture.texCoord
        );
        material.metallicRoughnessTexture.transform = this.createTextureTransform(source.metallicRoughnessTexture);
      }
      material.emissive = Color.from(source.emissiveFactor);
      if (source.emissiveTexture) {
        material.emissiveTexture = new StandardMaterialTexture(
          source.emissiveTexture.baseTexture,
          source.emissiveTexture.texCoord
        );
        material.emissiveTexture.transform = this.createTextureTransform(source.emissiveTexture);
      }
      switch (source.alphaMode) {
        case "BLEND": {
          material.alphaMode = StandardMaterialAlphaMode.blend;
          material.renderSortType = MaterialRenderSortType.transparent;
          break;
        }
        case "MASK": {
          material.alphaMode = StandardMaterialAlphaMode.mask;
          break;
        }
        case "OPAQUE": {
          material.alphaMode = StandardMaterialAlphaMode.blend;
          break;
        }
      }
      material.unlit = source.unlit;
      material.doubleSided = source.doubleSided;
      material.alphaCutoff = source.alphaCutoff;
      if (source.normalTexture) {
        material.normalTexture = new StandardMaterialNormalTexture(
          source.normalTexture.baseTexture,
          source.normalTexture.scale,
          source.normalTexture.texCoord
        );
        material.normalTexture.transform = this.createTextureTransform(source.normalTexture);
      }
      if (source.occlusionTexture) {
        material.occlusionTexture = new StandardMaterialOcclusionTexture(
          source.occlusionTexture.baseTexture,
          source.occlusionTexture.strength,
          source.occlusionTexture.texCoord
        );
        material.occlusionTexture.transform = this.createTextureTransform(source.occlusionTexture);
      }
      return material;
    }
    createTextureTransform(texture) {
      if (texture.transform) {
        const transform = new TextureTransform();
        if (texture.transform.offset) {
          transform.offset.x = texture.transform.offset[0];
          transform.offset.y = texture.transform.offset[1];
        }
        if (texture.transform.rotation !== void 0) {
          transform.rotation = texture.transform.rotation;
        }
        if (texture.transform.scale) {
          transform.scale.x = texture.transform.scale[0];
          transform.scale.y = texture.transform.scale[1];
        }
        return transform;
      }
    }
  }

  var img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAADAFBMVEX/AACvAwC4BgC1BQD7AAD3AQDzAQD+AAD9AAD8AQDpAQC/CACxAwD5BgDACwCtAwDxAQC9CADDEQCrAwC7BwC4AQDfAQB+AADvAQD1AQD7AwB7AABrAADHAQDCDgDiAQCyBQCRAQD5AAC1AQDYAQDNAQCpAQCUAQCeAQB0AABhAAD3BwCnAQDCBwCMAACOAAD6BABvAADFAgDsAQD4AACIAADEDADKAQDnAQCfAQCoAwDuEADqFACAAACFAACKAADzCwCCAAC/AQCbAgDKDQDwDgC9AQDBAgCiAAC7AQCkAADlAQD0CACzAQDjGwBoAADEFgB4AAD2CADGEQDGDADQAQDbAQDGCADSAQDNCwDWAQDdAQDUAQBlAAB2AADJCADBGgCVAgDOEADtAQBxAADSDADBFgCZAADnGADXDADcIgDKEgDDAQBcAADQLQCkAwDSEADPCADfHgClAgDXBwDTCADkDACYAAC9IACxLgCiAwCZAgDIFgDINgDdDADxCgDuCACSAQDnEADqCgCPAQBYAAC+HADYJgDLMACWAADOFgDbEQCtMwDSGwCGAADLBgC4JwDbGADaDADBIACoVQDRIQCgAgCxTQDHGwDVKQC6IwDCPACRbADGIQDMGwBUAADgEQDgBwDXEgDkFQDkBgCHdgDnCQDSFQC1KgDWFwDgFwDgDACaRwDCJwCcAADLKAC4LwC2RwDELwCYZADLIACkPQDcBgC9KACFXgDrEAB/ZQCoOgDGKAC+LgDYHACpTwC6QwCWTQB5bQCiWwCcAgCfQgBxdACMVgCzNAB9fwCeYADXIQC4NwC+NgCxOgCHbQCRUQDDNwCrOQDRJwCnRQCYWQCuQQBnfQC+QACNZABziwBskAAY4QCXAgB4hQBghgBllwC1QACtSACfTgBfngCPXABYpQChSAC7PAB/dwCeVABTkQBKnABRrABBuwA4wwBcjgBKtAByfAAxywBApQA3sAAo1QBshgAK8QAY0QBXmgAkxgBPpAAqugBFrgA1uwB98tmWAAAOvklEQVR4nO3Ye1jW5RnA8d+Wtmmews2yJTlXrVWUmUNLt5xSVrpygqJZQShMwqWYOHSWhvMwkSESRRaej5hT8ZiJpCvDI5annGYecmpaOWdhHnff93O6n+f3exFc17yubTfG1V9+P8/9/F54X73Tp/fs+fqfX37xj8///um+3X/bu27GjDfeWLT+ry+//OqrC9/56PXXX3hh9HPPvTZq1LPP9u//2GO9e7du3bpVq1YPPtimTZuOHTvfAVO7dtOmN9xwQ40aNb6P8z01XqXm/4DTp09//b+9gT2n91zZDezZc6U3sOcKb+CbKw745hvo/7cALkcAgLNwA198fsUAZ8+epUfg8081YNF/EnD2/NmzX14UN3AZG+j8LQDOn7948YsLdAO7964jwHof4DUOeKuSgEoJCPDVhQvn5CPgXsEHLqD3twy4eP4rGAM4OqNMAEqqBGgaCKiM4KLsnzvz7wIucwUIOHXqFAD2nagS4EEGCHkHlSBcwPypc8fPnDmxu7xcAtZXFtAxEFClS7iA/ePHj585se+T8r0nsY+vQgQsrAqA/zC2VnApwgXKHz9z7MSJ8vKT66oM6GwDggQVE85h/tgx6H+iALvoVVgJQBsNqOAOLiUAwLHj1P+k/OTJo0fLynYtWrQdAQeCAI+FBFyu4MyZYzjQ37lTAbYDoAQ28M47RwAw2g94CwFD1UMQBHAFoQ0EOCH7a9dAf9eu7ds/gwUcsAGjLEArDehMAHEHFQpCIPadwDr2d0IfF4B9Adh/5MgmDdggANM4IPAOKhIEMPbp/tq1a9esWbFr1yEEHATA/v1HPpKArQLQXwBaM4C6g6oILM1umRf9MgUoEYAjHPCsAfCHwFqBJagMwSsvL9+p+2tWLN91CAEHAbBDAIoAsHXraxsUYFqGfQfOCmzBpQme6K8V+1+xAvqH8AYObyPAJgLMl4DC/oUIyNCAoXwFwYJLGby9J+HhXyvPv2L58kOHtsACDpZs2wGAjQgoQsDWDRtWwQYKC6dN660BQ4cGrUAIOKEihLdO9CmP/fcPbVl9EBagAEVFRfMBkEeAQgRMQwAKhqKAraBJU74DhxBK4a07KvKiv/z997cA4DABNm+0AatyJECuYJgEKEETJahWrUYIQ8DviaNH1xwVedO3ASsJkAeA/oV0BxkZGbiCYQgY2rGjuITqtWs3byIJ1aoZQqCBabwZKi/6CFgt+wgoFhvII0COWIEGGAEAqtdurgRNqlmEChFeWVkZy8u+BhQX0wbmWwApGNbKABre0bB69eYkAEITIbAMoRQIKMO6Of+bb7733ra3P9y8uXTjgmIQrFzpBwzPGP7WMLaChjDVDQG/BRkCJN4b8MtH1k1/yRIDmAeAxQDIQgAIJtMGADA8tEBMtWqhERri7cI5dEjkZf+9JW8DoLR0AQDm+QCTBQBGCOoRoaEhMINBhHJ4i/Bnn8xTXy6AAxYbQM5kAAy0BTBXw4Qg2Agfw4O3PyDYIvK6//aHY0s5YPHEvKw5c1YJwOSBAwcKAAmuB0A9LQgkuAhG8dZvhxF1kRcLGDsW+wuWLQNAAQDysrJAAIBMIcjImKkFQ68fWq/j1RaBDC4iEEKA1dtlXpyfFjB2EADGIaAAARMJMDUnM1OtYOZMtoJ6MA4hpMF2eJ/hrD64+k19fNEfO2jQbAUAwcSJCJgzNVMLZhoBGhwCM4RU0CDgIIy/X0p9CZgoATlCMHeuLbgepp5LEAaFCKXwXj5Ygj/7Dx+WeeiPpfMPmj2bALkCkJU1a9asOVMVgAvu9RG0QSK0ws/wSkpKDsu+yBNA9MdNWJaeC4D8fNjAmFlZCEDBi3O1gAj39uw5rKcmuAaFMAoOAcDhkm0wS7aZvOqPW5aePk8DxsAKJEAKpmsBEHoSga+BIwzDcjRv7h04cIDnqY8PIC1gQjpuIB8BYyyAEExHQc2ZNYfXvNclaIOFYAwlQcCBHdu2URx+/snzE2CCAOQCYIjcQD8QjM8cLwXTpxNhZs2aKDAEaTAIR8Eh3sIDO2g+xBlr+uNEHwDxCBgyhlbQDwTJ48cLwZQpStByuCHYBoYIYMB4C/djfbPKD1LHFxcAgHgBSEFAPwAkJyvBlCmS0KFlSyS4Bo2wFI7D2w+zGWdsqdtHwMj43PhO0EdAQgIA+iVrwZQpFqGmJAiDD+EyJEQD4HdPqcrLPgBGjoyPj+/UCQEpCQkkSHQE02k6KEKAwVK4DO/Ikf0bN5ZSvlTl9QNAfQB0QoAUJCrB0qVLzQ46dCACM0iEUVgMDQHARhwSLJhtHV8vQAJIkJjIBZJwUwiDQjCF65CABTSiLvoT0kdCHwBJkDeAxEQlGCAE0nCTFDCDi7AZyuFtwllAgtnjFjh57Cc5G0BDWlryABwh6IEAmg7GIBFKwRi2w/sA+8ViAzovnj8EJBEgOjoaAVHqDkCQNmDAeC3o0aBBkEEhtIIzeirAB5uKN8Gb3+JlOLpu+hKAhKjuOImpBEgbwJeAhgYNLINEaIVhcAcAioqpD4IJSEhPF4+f6gMgDPPRKVFRJEhNlQJJ6Np1aVcUEEEaNEIpDIM5UOLBR6+i4iK5gGWyrvpiA2FhtIGoaFcgAANuvrkrInr0sPbAEEEM5fBeQME8GpkXdXX+pKQwBaDpLgmpaS4Bpoe7CEuhGRzijSZA0Tx46wNf6bmqD6cfqfpCEBMVowipqZrw5JNCoAwMYRQWgzlaImD0ShzcQK6Yker1Z/oIiIkhQTYTkOFJmCeeGPDEzS7Cp3AcAuKNnj9aAApyhSCeJkn35QoiY3DioqLi4rKzu2cLQrfULt26pXUTBhhmsBUWw3J48Nl7PgDgnWeBvy/rYeFhkTAkoMmmIUOXLmDoRgaDcBWKYTsI4j1HggI58fG5/PyqHx4eKQWxcUEEMrgIo1AM7WAQbyv0F8+nem5BfH7g+RUgMiYWhgGyb7lFAAIQUsEY2mEgDQAAAvjotbgA3/zmF+R3gt9++vxJ4bB904+MlWMbYCyEUIRkMAhIALB1MU1BPgri8/F3j9p+nSTR9wli+UU4CEshGcphQ1Di4T+ACUE+Tic58vEPNxPpGgSiRYsW2dktblHTJZihHBqiJd7WPCGYKABKIG6/TlIditP3iIjICJjY2AgJaNSoURz810JNgEIytENDtMTLy8P+RBx895vP+2EyXocmIjxCT7NmzWLhT2xss0Y0LfwKy6Egfok3Ko+GBPDecwjrh1t9EKiJlQY9jVwGdwRCtMTbkLdB5qkP7770+cOsvEWQ06dPAIM7QkI0xduwAf/1JcsIojtFq3yS069zjRxot2/fnr6179PHZgQ6LIhFAQDk87LGjNEAGHMBTllPe3f6WJBG1rSowOKtWoWCiVn42S8lRfSjzQOg+9daQ4i2OMESzWlUEaWFAKzCKxCAISkKEM4X4NTlPKSmbVsfpY89AVtRGASskn3YgALwPo/+gM0j1z7ykG/asgm09HHuCAFz5mTNmiUBKSkuILgO/aCpqqZPMy8HAXMMgG2g6v2KOG2DOV5OjgCAIIEAQAiL9PV1+Lt8fhhiqgACQI4AzEpIUBuAXzl2P6BdUb/SJHB4hQYgriAK+5G8789fJeYnlZlLoDiANhAVHRPQ97Vxfl3ZqciFgBwCwOfOlAT4+BWjAeb4/vhVVzWmv7tx48Y8VUtO5WUEmDp1zqx++MlX98PVj5+gfGM1svadKkwtNmTwCguhP3Vqv34JQIhiC3D6dtzXrRtybEBd+aUHATkCADcAnz8V4Bp1Ab48a/NQ/VBzq/1Vt775ql+/LgIy3Q3wBZi8rNttq1T1qX8rADIlICGKAGwBvM/PbrXZX3e/nDsrnkfpjxxvWmFmjtpAlAbQr1+nz+tW3G0+b+bRS443bbLeALsBp6/zfOsmjak7Te/hwLlPfuEfNgTI1IAYC8D7Tp7i+rR9+wZkX1Fznzu34cj/B8BkAUhM6C5fhE6/sezrPB1dxfv27Tt48GAryiowf6lg2rVrpwGJGhBBAKtv57Eu44NpXnnlYRW+ze62k/PbkCMByQDorgF6AVaf8verel9ZV2dmXTf5ezEfq/kTHwFITsYFdKfXAFuA7rt5FtdtWeZRlntGzE/VvKTGBsQhIIIWENCnZ17nRR3K74q2KausSb7E5sdq/kjDAVEAiBU3IBeg+ip/P+bl4eno78KoY4u0DPMqy8m5W85dd92FgBcJQDcA/Yg61gJ438qr+h9UW6RNmVdVTs8DarwMAIxXgFi2AKtv52Ud4jAyTm23zLM6+cDP+ViAOPjszxbg9k2ezi7qIq7OrdIm7Eb/bOaXOA5APIJiAVZfHV/m6fCmzto6bYWtJs6v1HgZAzUgLk7dgLwA3rfydHiqO3GTtsJu9RdmADCXAKnyBtgC3D48eioPh6ezm7qImzYvO9nr+AQC1AU4fXr0VF5unuombtqs7O/+yIwNiIyANwJsAbIv13+buHuZ99V13LSdsMn+Rs3TEpAGAHoEQvX18Vle1dXRVdzfdsNPi/kZjA2I4AC8ANaX2w/KO3HetsumK6dXLw2AF4F4BCrq06On825dxe12ULmXmHtgHIBeAF2A24cXXnDe1EO07fI9em68UQFSu2drAFuA7os89WXeqeujO20rzcJqLIC5AbmA55+nPj++P8/PruPs3Fb6RjaP4xgAPoNqAbVUv29AXyyf8vrwvjo7tz/9uJqnnnrKG64B4gbEAswFqP4zKn+3nXfr+uSBbVamuf12CUjkAL2Avub+nzHHD8izuj65G/elxTgbEDeACxAPQIi+P8/q5ujB7dutEYC0tNTsuKAFsH6IvDy8r27HA9q/EyMBiRyAL4FL9HneHN49Oo8HtGFGjCBAMgPQDcAC6ALg5w/vh8zze684ztJiFKA7/RTAR4BugBaALwDTt4+v887hWd2N+9ojRkyaNIkAA+gZjIiQN0ALUBfg9HX+OjsfWPfHrTYNB4gbkAugC4D+x9QX128f38mHrPvik/gogH4EGtfSC4ALkH08v1y/yYu77+XmA+vBcZx/AeDdATn/vA1ZAAAAAElFTkSuQmCC";

  class ImageBasedLighting {
    get diffuse() {
      return this._diffuse;
    }
    get specular() {
      return this._specular;
    }
    constructor(diffuse, specular) {
      this._diffuse = diffuse;
      this._specular = specular;
    }
    get valid() {
      return this._diffuse.valid && this._specular.valid && (!this.lookupBrdf || this.lookupBrdf.valid);
    }
  }
  ImageBasedLighting.defaultLookupBrdf = PixiCore.Texture.from(img, {
    mipmap: constants.MIPMAP_MODES.OFF
  });

  const shaders = {};
  const getLightingEnvironmentConfigId = (env) => {
    return env ? env.lights.length + (env.imageBasedLighting ? 0.5 : 0) : 0;
  };
  class StandardMaterial extends Material {
    constructor() {
      super(...arguments);
      this._lightingEnvironmentConfigId = 0;
      this._unlit = false;
      this._alphaMode = StandardMaterialAlphaMode.blend;
      this._baseColorFactor = new Float32Array(4);
      this._instancingEnabled = false;
      this._skinUniforms = new StandardMaterialSkinUniforms();
      this.roughness = 1;
      this.metallic = 1;
      this.baseColor = new Color(1, 1, 1, 1);
      this.alphaCutoff = 0.5;
      this.emissive = new Color(0, 0, 0);
      this.exposure = 1;
    }
    get baseColorTexture() {
      return this._baseColorTexture;
    }
    set baseColorTexture(value) {
      if (value !== this._baseColorTexture) {
        this.invalidateShader();
        if (!(value == null ? void 0 : value.transform) && (value == null ? void 0 : value.frame) && !(value == null ? void 0 : value.noFrame)) {
          value.transform = TextureTransform.fromTexture(value);
        }
        this._baseColorTexture = value;
      }
    }
    get metallicRoughnessTexture() {
      return this._metallicRoughnessTexture;
    }
    set metallicRoughnessTexture(value) {
      if (value !== this._metallicRoughnessTexture) {
        this.invalidateShader();
        if (!(value == null ? void 0 : value.transform) && (value == null ? void 0 : value.frame) && !(value == null ? void 0 : value.noFrame)) {
          value.transform = TextureTransform.fromTexture(value);
        }
        this._metallicRoughnessTexture = value;
      }
    }
    get normalTexture() {
      return this._normalTexture;
    }
    set normalTexture(value) {
      if (value !== this._normalTexture) {
        this.invalidateShader();
        if (!(value == null ? void 0 : value.transform) && (value == null ? void 0 : value.frame) && !(value == null ? void 0 : value.noFrame)) {
          value.transform = TextureTransform.fromTexture(value);
        }
        this._normalTexture = value;
      }
    }
    get occlusionTexture() {
      return this._occlusionTexture;
    }
    set occlusionTexture(value) {
      if (value !== this._occlusionTexture) {
        this.invalidateShader();
        if (!(value == null ? void 0 : value.transform) && (value == null ? void 0 : value.frame) && !(value == null ? void 0 : value.noFrame)) {
          value.transform = TextureTransform.fromTexture(value);
        }
        this._occlusionTexture = value;
      }
    }
    get emissiveTexture() {
      return this._emissiveTexture;
    }
    set emissiveTexture(value) {
      if (value !== this._emissiveTexture) {
        this.invalidateShader();
        if (!(value == null ? void 0 : value.transform) && (value == null ? void 0 : value.frame) && !(value == null ? void 0 : value.noFrame)) {
          value.transform = TextureTransform.fromTexture(value);
        }
        this._emissiveTexture = value;
      }
    }
    get alphaMode() {
      return this._alphaMode;
    }
    set alphaMode(value) {
      if (this._alphaMode !== value) {
        this._alphaMode = value;
        this.invalidateShader();
      }
    }
    get shadowCastingLight() {
      return this._shadowCastingLight;
    }
    set shadowCastingLight(value) {
      if (value !== this._shadowCastingLight) {
        this.invalidateShader();
        this._shadowCastingLight = value;
      }
    }
    get debugMode() {
      return this._debugMode;
    }
    set debugMode(value) {
      if (this._debugMode !== value) {
        this.invalidateShader();
        this._debugMode = value;
      }
    }
    get lightingEnvironment() {
      return this._lightingEnvironment;
    }
    set lightingEnvironment(value) {
      if (value !== this._lightingEnvironment) {
        this.invalidateShader();
        this._lightingEnvironmentConfigId = getLightingEnvironmentConfigId(value);
        this._lightingEnvironment = value;
      }
    }
    get unlit() {
      return this._unlit;
    }
    set unlit(value) {
      if (this._unlit !== value) {
        this._unlit = value;
        this.invalidateShader();
      }
    }
    destroy() {
      var _a, _b, _c, _d, _e;
      (_a = this._baseColorTexture) == null ? void 0 : _a.destroy();
      (_b = this._normalTexture) == null ? void 0 : _b.destroy();
      (_c = this._emissiveTexture) == null ? void 0 : _c.destroy();
      (_d = this._occlusionTexture) == null ? void 0 : _d.destroy();
      (_e = this._metallicRoughnessTexture) == null ? void 0 : _e.destroy();
      this._skinUniforms.destroy();
    }
    invalidateShader() {
      this._shader = void 0;
    }
    static create(source) {
      return new StandardMaterialFactory().create(source);
    }
    render(mesh, renderer) {
      if (!this._instancingEnabled && mesh.instances.length > 0) {
        this.invalidateShader();
        this._instancingEnabled = true;
      }
      if (this._instancingEnabled && mesh.instances.length === 0) {
        this.invalidateShader();
        this._instancingEnabled = false;
      }
      let lighting = this.lightingEnvironment || LightingEnvironment.main;
      let configId = getLightingEnvironmentConfigId(lighting);
      if (configId !== this._lightingEnvironmentConfigId) {
        this.invalidateShader();
        this._lightingEnvironmentConfigId = configId;
      }
      super.render(mesh, renderer);
    }
    get isInstancingSupported() {
      return true;
    }
    createInstance() {
      return new InstancedStandardMaterial(this);
    }
    createShader(mesh, renderer) {
      if (renderer.context.webGLVersion === 1) {
        let extensions = ["EXT_shader_texture_lod", "OES_standard_derivatives"];
        for (let ext of extensions) {
          if (!renderer.gl.getExtension(ext)) ;
        }
      }
      let lightingEnvironment = this.lightingEnvironment || LightingEnvironment.main;
      let features = StandardMaterialFeatureSet.build(renderer, mesh, mesh.geometry, this, lightingEnvironment);
      if (!features) {
        return void 0;
      }
      if (mesh.skin && StandardMaterialFeatureSet.hasSkinningTextureFeature(features)) {
        this._skinUniforms.enableJointMatrixTextures(mesh.skin.joints.length);
      }
      let checksum = features.join(",");
      if (!shaders[checksum]) {
        shaders[checksum] = StandardShader.build(renderer, features);
      }
      return shaders[checksum];
    }
    updateUniforms(mesh, shader) {
      var _a, _b, _c, _d, _e;
      for (let i = 0; i < 3; i++) {
        this._baseColorFactor[i] = this.baseColor.rgba[i];
      }
      this._baseColorFactor[3] = this.baseColor.a * mesh.worldAlpha;
      let camera = this.camera || Camera.main;
      if (mesh.skin) {
        this._skinUniforms.update(mesh, shader);
      }
      shader.uniforms.u_Camera = camera.worldTransform.position.array;
      shader.uniforms.u_ViewProjectionMatrix = camera.viewProjection.array;
      shader.uniforms.u_ViewMatrix = camera.view.array;
      shader.uniforms.u_Exposure = this.exposure;
      shader.uniforms.u_MetallicFactor = this.metallic;
      shader.uniforms.u_RoughnessFactor = this.roughness;
      shader.uniforms.u_BaseColorFactor = this._baseColorFactor;
      shader.uniforms.u_ModelMatrix = mesh.worldTransform.array;
      shader.uniforms.u_NormalMatrix = mesh.transform.normalTransform.array;
      if (this._alphaMode === StandardMaterialAlphaMode.mask) {
        shader.uniforms.u_AlphaCutoff = this.alphaCutoff;
      }
      if (mesh.targetWeights && mesh.targetWeights.length > 0) {
        shader.uniforms.u_morphWeights = mesh.targetWeights;
      }
      if ((_a = this.baseColorTexture) == null ? void 0 : _a.valid) {
        shader.uniforms.u_BaseColorSampler = this.baseColorTexture;
        shader.uniforms.u_BaseColorUVSet = this.baseColorTexture.uvSet || 0;
        if (this.baseColorTexture.transform) {
          shader.uniforms.u_BaseColorUVTransform = this.baseColorTexture.transform.array;
        }
      }
      let lightingEnvironment = this.lightingEnvironment || LightingEnvironment.main;
      for (let i = 0; i < lightingEnvironment.lights.length; i++) {
        let light = lightingEnvironment.lights[i];
        let type = 0;
        switch (light.type) {
          case LightType.point:
            type = 1;
            break;
          case LightType.directional:
            type = 0;
            break;
          case LightType.spot:
            type = 2;
            break;
        }
        shader.uniforms[`u_Lights[${i}].type`] = type;
        shader.uniforms[`u_Lights[${i}].position`] = light.worldTransform.position.array;
        shader.uniforms[`u_Lights[${i}].direction`] = light.worldTransform.forward.array;
        shader.uniforms[`u_Lights[${i}].range`] = light.range;
        shader.uniforms[`u_Lights[${i}].color`] = light.color.rgb;
        shader.uniforms[`u_Lights[${i}].intensity`] = light.intensity;
        shader.uniforms[`u_Lights[${i}].innerConeCos`] = Math.cos(light.innerConeAngle * math.DEG_TO_RAD);
        shader.uniforms[`u_Lights[${i}].outerConeCos`] = Math.cos(light.outerConeAngle * math.DEG_TO_RAD);
      }
      if (lightingEnvironment.fog) {
        shader.uniforms.u_FogNear = lightingEnvironment.fog.near;
        shader.uniforms.u_FogFar = lightingEnvironment.fog.far;
        shader.uniforms.u_FogColor = lightingEnvironment.fog.color.rgb;
      }
      if (this._shadowCastingLight) {
        shader.uniforms.u_ShadowSampler = this._shadowCastingLight.shadowTexture;
        shader.uniforms.u_LightViewProjectionMatrix = this._shadowCastingLight.lightViewProjection;
        shader.uniforms.u_ShadowLightIndex = lightingEnvironment.lights.indexOf(this._shadowCastingLight.light);
      }
      let imageBasedLighting = lightingEnvironment.imageBasedLighting;
      if (imageBasedLighting == null ? void 0 : imageBasedLighting.valid) {
        shader.uniforms.u_DiffuseEnvSampler = imageBasedLighting.diffuse;
        shader.uniforms.u_SpecularEnvSampler = imageBasedLighting.specular;
        shader.uniforms.u_brdfLUT = imageBasedLighting.lookupBrdf || ImageBasedLighting.defaultLookupBrdf;
        shader.uniforms.u_MipCount = imageBasedLighting.specular.levels - 1;
      }
      if ((_b = this.emissiveTexture) == null ? void 0 : _b.valid) {
        shader.uniforms.u_EmissiveSampler = this.emissiveTexture;
        shader.uniforms.u_EmissiveUVSet = this.emissiveTexture.uvSet || 0;
        shader.uniforms.u_EmissiveFactor = this.emissive.rgb;
        if (this.emissiveTexture.transform) {
          shader.uniforms.u_EmissiveUVTransform = this.emissiveTexture.transform.array;
        }
      }
      if ((_c = this.normalTexture) == null ? void 0 : _c.valid) {
        shader.uniforms.u_NormalSampler = this.normalTexture;
        shader.uniforms.u_NormalScale = this.normalTexture.scale || 1;
        shader.uniforms.u_NormalUVSet = this.normalTexture.uvSet || 0;
        if (this.normalTexture.transform) {
          shader.uniforms.u_NormalUVTransform = this.normalTexture.transform.array;
        }
      }
      if ((_d = this.metallicRoughnessTexture) == null ? void 0 : _d.valid) {
        shader.uniforms.u_MetallicRoughnessSampler = this.metallicRoughnessTexture;
        shader.uniforms.u_MetallicRoughnessUVSet = this.metallicRoughnessTexture.uvSet || 0;
        if (this.metallicRoughnessTexture.transform) {
          shader.uniforms.u_MetallicRoughnessUVTransform = this.metallicRoughnessTexture.transform.array;
        }
      }
      if ((_e = this.occlusionTexture) == null ? void 0 : _e.valid) {
        shader.uniforms.u_OcclusionSampler = this.occlusionTexture;
        shader.uniforms.u_OcclusionStrength = this.occlusionTexture.strength || 1;
        shader.uniforms.u_OcclusionUVSet = this.occlusionTexture.uvSet || 0;
        if (this.occlusionTexture.transform) {
          shader.uniforms.u_OcclusionUVTransform = this.occlusionTexture.transform.array;
        }
      }
    }
  }

  class AABB {
    constructor() {
      this._onChanged = () => {
        this._center.set(
          (this._min.x + this._max.x) / 2,
          (this._min.y + this._max.y) / 2,
          (this._min.z + this._max.z) / 2
        );
        this._extents.set(
          Math.abs(this._max.x - this._center.x),
          Math.abs(this._max.y - this._center.y),
          Math.abs(this._max.z - this._center.z)
        );
        this._size.set(
          this._extents.x * 2,
          this._extents.y * 2,
          this._extents.z * 2
        );
      };
      this._min = new Point3D(0, 0, 0, this._onChanged, this);
      this._max = new Point3D(0, 0, 0, this._onChanged, this);
      this._center = new Point3D(0, 0, 0, () => {
      }, this);
      this._size = new Point3D(0, 0, 0, () => {
      }, this);
      this._extents = new Point3D(0, 0, 0, () => {
      }, this);
    }
    get min() {
      return this._min;
    }
    set min(value) {
      this._min.copyFrom(value);
    }
    get max() {
      return this._max;
    }
    set max(value) {
      this._max.copyFrom(value);
    }
    get center() {
      return this._center;
    }
    get size() {
      return this._size;
    }
    get extents() {
      return this._extents;
    }
    static from(source) {
      let aabb = new AABB();
      aabb.min.setFrom(source.min);
      aabb.max.setFrom(source.max);
      return aabb;
    }
    encapsulate(point) {
      this._min.x = Math.min(this._min.x, point.x);
      this._min.y = Math.min(this._min.y, point.y);
      this._min.z = Math.min(this._min.z, point.z);
      this._max.x = Math.max(this._max.x, point.x);
      this._max.y = Math.max(this._max.y, point.y);
      this._max.z = Math.max(this._max.z, point.z);
    }
  }

  class CircleGeometry {
    static create(options = {}) {
      var _a, _b, _c, _d;
      const radius = (_a = options == null ? void 0 : options.radius) != null ? _a : 1;
      const segments = Math.max(3, Math.floor((_b = options == null ? void 0 : options.segments) != null ? _b : 32));
      const thetaStart = (_c = options == null ? void 0 : options.thetaStart) != null ? _c : 0;
      const thetaLength = (_d = options == null ? void 0 : options.thetaLength) != null ? _d : Math.PI * 2;
      const indices = [];
      const positions = [];
      const normals = [];
      const uvs = [];
      const vertex = Vec3.create();
      const uv = Vec3.create();
      positions.push(0, 0, 0);
      normals.push(0, 0, 1);
      uvs.push(0.5, 0.5);
      for (let s = 0, i = 3; s <= segments; s += 1, i += 3) {
        const segment = thetaStart + s / segments * thetaLength;
        vertex[0] = radius * Math.cos(segment);
        vertex[1] = radius * Math.sin(segment);
        positions.push(vertex[0], vertex[1], vertex[2]);
        normals.push(0, 0, 1);
        uv[0] = (positions[i] / radius + 1) / 2;
        uv[1] = (positions[i + 1] / radius + 1) / 2;
        uvs.push(uv[0], uv[1]);
      }
      for (let i = 1; i <= segments; i += 1) {
        indices.push(i, i + 1, 0);
      }
      return Object.assign(new MeshGeometry3D(), {
        normals: {
          buffer: new Float32Array(normals)
        },
        uvs: [
          {
            buffer: new Float32Array(uvs)
          }
        ],
        indices: {
          buffer: new Uint16Array(indices)
        },
        positions: {
          buffer: new Float32Array(positions)
        }
      });
    }
  }

  class CylinderGeometry {
    static create(options = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const radiusTop = (_a = options == null ? void 0 : options.radiusTop) != null ? _a : 1;
      const radiusBottom = (_b = options == null ? void 0 : options.radiusBottom) != null ? _b : 1;
      const height = (_c = options == null ? void 0 : options.height) != null ? _c : 1;
      const radialSegments = Math.floor((_d = options == null ? void 0 : options.radialSegments) != null ? _d : 32);
      const heightSegments = Math.floor((_e = options == null ? void 0 : options.heightSegments) != null ? _e : 1);
      const openEnded = (_f = options == null ? void 0 : options.openEnded) != null ? _f : false;
      const thetaStart = (_g = options == null ? void 0 : options.thetaStart) != null ? _g : 0;
      const thetaLength = (_h = options == null ? void 0 : options.thetaLength) != null ? _h : Math.PI * 2;
      const indices = [];
      const positions = [];
      const uvs = [];
      const normals = [];
      let index = 0;
      const indexArray = [];
      const halfHeight = height / 2;
      const generateTorso = () => {
        const slope = (radiusBottom - radiusTop) / height;
        for (let y = 0; y <= heightSegments; y += 1) {
          const indexRow = [];
          const v = y / heightSegments;
          const radius = v * (radiusBottom - radiusTop) + radiusTop;
          for (let x = 0; x <= radialSegments; x += 1) {
            const u = x / radialSegments;
            const theta = u * thetaLength + thetaStart;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            const vertexX = radius * sinTheta;
            const vertexY = -v * height + halfHeight;
            const vertexZ = radius * cosTheta;
            positions.push(vertexX, vertexY, vertexZ);
            const normalX = sinTheta;
            const normalY = slope;
            const normalZ = cosTheta;
            const normal = Vec3.normalize(
              Vec3.fromValues(normalX, normalY, normalZ)
            );
            normals.push(normal[0], normal[1], normal[2]);
            uvs.push(u, 1 - v);
            indexRow.push(index);
            index += 1;
          }
          indexArray.push(indexRow);
        }
        for (let x = 0; x < radialSegments; x += 1) {
          for (let y = 0; y < heightSegments; y += 1) {
            const a = indexArray[y][x];
            const b = indexArray[y + 1][x];
            const c = indexArray[y + 1][x + 1];
            const d = indexArray[y][x + 1];
            indices.push(a, b, d);
            indices.push(b, c, d);
          }
        }
      };
      const generateCap = (top) => {
        const centerIndexStart = index;
        const radius = top === true ? radiusTop : radiusBottom;
        const sign = top === true ? 1 : -1;
        for (let x = 1; x <= radialSegments; x += 1) {
          positions.push(0, halfHeight * sign, 0);
          normals.push(0, sign, 0);
          uvs.push(0.5, 0.5);
          index += 1;
        }
        const centerIndexEnd = index;
        for (let x = 0; x <= radialSegments; x += 1) {
          const u = x / radialSegments;
          const theta = u * thetaLength + thetaStart;
          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);
          const vertexX = radius * sinTheta;
          const vertexY = halfHeight * sign;
          const vertexZ = radius * cosTheta;
          positions.push(vertexX, vertexY, vertexZ);
          normals.push(0, sign, 0);
          const uvX = cosTheta * 0.5 + 0.5;
          const uvY = sinTheta * 0.5 * sign + 0.5;
          uvs.push(uvX, uvY);
          index += 1;
        }
        for (let x = 0; x < radialSegments; x += 1) {
          const c = centerIndexStart + x;
          const i = centerIndexEnd + x;
          if (top === true) {
            indices.push(i, i + 1, c);
          } else {
            indices.push(i + 1, i, c);
          }
        }
      };
      generateTorso();
      if (openEnded === false) {
        if (radiusTop > 0)
          generateCap(true);
        if (radiusBottom > 0)
          generateCap(false);
      }
      return Object.assign(new MeshGeometry3D(), {
        normals: {
          buffer: new Float32Array(normals)
        },
        uvs: [
          {
            buffer: new Float32Array(uvs)
          }
        ],
        indices: {
          buffer: new Uint16Array(indices)
        },
        positions: {
          buffer: new Float32Array(positions)
        }
      });
    }
  }

  var SphereGeometry;
  ((SphereGeometry2) => {
    function create(options = {}) {
      const { radius = 1, segments = 32, rings = 16 } = options;
      const grid = [];
      const indices = [];
      const positions = [];
      const uvs = [];
      const normals = [];
      let index = 0;
      for (let iy = 0; iy <= rings; iy++) {
        const vertices = [];
        const v = iy / rings;
        let uOffset = 0;
        if (iy == 0) {
          uOffset = 0.5 / segments;
        } else if (iy == rings) {
          uOffset = -0.5 / segments;
        }
        for (let ix = 0; ix <= segments; ix++) {
          const u = ix / segments;
          let x = -radius * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
          let y = radius * Math.cos(v * Math.PI);
          let z = radius * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);
          let pos = Vec3.fromValues(x, y, z);
          positions.push(x, y, z);
          normals.push(...Vec3.normalize(pos));
          uvs.push(u + uOffset, 1 - v);
          vertices.push(index++);
        }
        grid.push(vertices);
      }
      for (let iy = 0; iy < rings; iy++) {
        for (let ix = 0; ix < segments; ix++) {
          const a = grid[iy][ix + 1];
          const b = grid[iy][ix];
          const c = grid[iy + 1][ix];
          const d = grid[iy + 1][ix + 1];
          if (iy !== 0) {
            indices.push(a, b, d);
          }
          if (iy !== rings - 1) {
            indices.push(b, c, d);
          }
        }
      }
      return Object.assign(new MeshGeometry3D(), {
        normals: {
          buffer: new Float32Array(normals)
        },
        uvs: [{
          buffer: new Float32Array(uvs)
        }],
        indices: {
          buffer: new Uint16Array(indices)
        },
        positions: {
          buffer: new Float32Array(positions)
        }
      });
    }
    SphereGeometry2.create = create;
  })(SphereGeometry || (SphereGeometry = {}));

  class Mesh3D extends Container3D {
    constructor(geometry, material) {
      super();
      this.geometry = geometry;
      this.material = material;
      this.pluginName = "pipeline";
      this.enabledRenderPasses = { "material": {} };
      this.renderSortOrder = 0;
      this._instances = [];
      if (!geometry) {
        throw new Error("PIXI3D: Geometry is required when creating a mesh.");
      }
    }
    get instances() {
      return this._instances;
    }
    createInstance() {
      var _a;
      if (this.material && !this.material.isInstancingSupported) {
        throw new Error("PIXI3D: Can't create instance of mesh, material does not support instancing.");
      }
      return this._instances[this._instances.push(new InstancedMesh3D(this, (_a = this.material) == null ? void 0 : _a.createInstance())) - 1];
    }
    removeInstance(instance) {
      const index = this._instances.indexOf(instance);
      if (index >= 0) {
        this._instances.splice(index, 1);
      }
    }
    enableRenderPass(name, options) {
      if (!this.enabledRenderPasses[name]) {
        this.enabledRenderPasses[name] = options || {};
      }
    }
    disableRenderPass(name) {
      if (this.enabledRenderPasses[name]) {
        delete this.enabledRenderPasses[name];
      }
    }
    isRenderPassEnabled(name) {
      return !!this.enabledRenderPasses[name];
    }
    destroy(options) {
      if (options === true || options && options.geometry) {
        this.geometry.destroy();
      }
      if (options === true || options && options.material) {
        if (this.material) {
          this.material.destroy();
        }
      }
      super.destroy(options);
    }
    _render(renderer) {
      renderer.batch.setObjectRenderer(
        renderer.plugins[this.pluginName]
      );
      if (this.skin) {
        this.skin.calculateJointMatrices();
      }
      renderer.plugins[this.pluginName].render(this);
    }
    getBoundingBox() {
      var _a, _b;
      if (!((_a = this.geometry.positions) == null ? void 0 : _a.min)) {
        return void 0;
      }
      if (!((_b = this.geometry.positions) == null ? void 0 : _b.max)) {
        return void 0;
      }
      let min = Vec3.transformMat4(
        this.geometry.positions.min,
        this.worldTransform.array
      );
      let max = Vec3.transformMat4(
        this.geometry.positions.max,
        this.worldTransform.array
      );
      for (let i = 0; i < 3; i++) {
        let temp = min[i];
        min[i] = Math.min(min[i], max[i]);
        max[i] = Math.max(temp, max[i]);
      }
      return AABB.from({ min, max });
    }
    static createQuad(material = new StandardMaterial()) {
      return new Mesh3D(QuadGeometry.create(), material);
    }
    static createCube(material = new StandardMaterial()) {
      return new Mesh3D(CubeGeometry.create(), material);
    }
    static createPlane(material = new StandardMaterial()) {
      return new Mesh3D(PlaneGeometry.create(), material);
    }
    static createSphere(material = new StandardMaterial(), options) {
      return new Mesh3D(SphereGeometry.create(options), material);
    }
    static createCircle(material = new StandardMaterial(), options = {}) {
      return new Mesh3D(CircleGeometry.create(options), material);
    }
    static createCylinder(material = new StandardMaterial(), options = {}) {
      return new Mesh3D(CylinderGeometry.create(options), material);
    }
  }

  class Animation extends utils.EventEmitter {
    constructor(name) {
      super();
      this.name = name;
      this.speed = 1;
      this.loop = false;
    }
    play(ticker$1 = ticker.Ticker.shared) {
      this.position = 0;
      if (!this._ticker) {
        this._update = () => {
          this.update(ticker$1.deltaMS / 1e3 * this.speed);
        };
        this._ticker = ticker$1.add(this._update);
      }
    }
    stop() {
      if (this._ticker && this._update) {
        this._ticker.remove(this._update);
        this._ticker = this._update = void 0;
      }
    }
    update(delta) {
      this.position += delta;
      if (this.position < this.duration) {
        return;
      }
      if (this.loop) {
        if (this.position > this.duration) {
          this.position = this.position % this.duration;
        }
      } else {
        this.position = this.duration;
        this.stop();
      }
      this.emit("complete");
    }
  }

  class glTFAnimation extends Animation {
    constructor(channels, name) {
      super(name);
      this._duration = 0;
      this._position = 0;
      this._channels = [];
      for (let channel of channels) {
        this._duration = Math.max(this._duration, channel.duration);
      }
      this._channels = channels;
    }
    get duration() {
      return this._duration;
    }
    get position() {
      return this._position;
    }
    set position(value) {
      this._position = value;
      for (let channel of this._channels) {
        channel.position = this._position;
      }
    }
  }

  class glTFAttribute {
    constructor(buffer, componentType, stride = 0, componentCount, normalized = false, min, max) {
      this.buffer = buffer;
      this.componentType = componentType;
      this.stride = stride;
      this.componentCount = componentCount;
      this.normalized = normalized;
      this.min = min;
      this.max = max;
    }
    static from(componentType, componentCount, buffer, offset, size, stride, normalized = false, min, max) {
      switch (componentType) {
        case 5125:
          return new glTFAttribute(
            new Uint32Array(buffer, offset, size),
            componentType,
            stride,
            componentCount,
            normalized,
            min,
            max
          );
        case 5126:
          return new glTFAttribute(
            new Float32Array(buffer, offset, size),
            componentType,
            stride,
            componentCount,
            normalized,
            min,
            max
          );
        case 5120:
          return new glTFAttribute(
            new Int8Array(buffer, offset, size),
            componentType,
            stride,
            componentCount,
            normalized,
            min,
            max
          );
        case 5121:
          return new glTFAttribute(
            new Uint8Array(buffer, offset, size),
            componentType,
            stride,
            componentCount,
            normalized,
            min,
            max
          );
        case 5122:
          return new glTFAttribute(
            new Int16Array(buffer, offset, size),
            componentType,
            stride,
            componentCount,
            normalized,
            min,
            max
          );
        case 5123:
          return new glTFAttribute(
            new Uint16Array(buffer, offset, size),
            componentType,
            stride,
            componentCount,
            normalized,
            min,
            max
          );
        default: {
          throw new Error(`PIXI3D: Unknown component type "${componentType}".`);
        }
      }
    }
  }

  class Skin {
    constructor(parent, joints) {
      this.parent = parent;
      this.joints = joints;
      this._jointMatrices = [];
      this._jointNormalMatrices = [];
      this._transformIds = [];
      this.jointNormalMatrices = new Float32Array(this.joints.length * 16);
      this.jointMatrices = new Float32Array(this.joints.length * 16);
      for (let i = 0; i < joints.length; i++) {
        this._transformIds.push(-1);
        this._jointMatrices.push(
          new Float32Array(this.jointMatrices.buffer, 16 * 4 * i, 16)
        );
        this._jointNormalMatrices.push(
          new Float32Array(this.jointNormalMatrices.buffer, 16 * 4 * i, 16)
        );
      }
    }
    calculateJointMatrices() {
      for (let i = 0; i < this.joints.length; i++) {
        if (this.joints[i].transform._worldID === this._transformIds[i]) {
          continue;
        }
        this._transformIds[i] = this.joints[i].transform._worldID;
        Mat4.multiply(
          this.joints[i].worldTransform.array,
          this.joints[i].inverseBindMatrix,
          this._jointMatrices[i]
        );
        Mat4.multiply(
          this.parent.transform.inverseWorldTransform.array,
          this._jointMatrices[i],
          this._jointMatrices[i]
        );
        Mat4.invert(this._jointMatrices[i], this._jointNormalMatrices[i]);
        Mat4.transpose(
          this._jointNormalMatrices[i],
          this._jointNormalMatrices[i]
        );
      }
    }
  }

  class Joint extends Container3D {
    constructor(inverseBindMatrix) {
      super();
      this.inverseBindMatrix = inverseBindMatrix;
    }
  }

  function getDenormalizeFunction(output, stride) {
    switch (output.constructor) {
      case Float32Array:
        return (data) => data;
      case Uint32Array:
        return (data) => {
          for (let i = 0; i < stride; i++) {
            data[i] = data[i] / 4294967295;
          }
          return data;
        };
      case Uint16Array:
        return (data) => {
          for (let i = 0; i < stride; i++) {
            data[i] = data[i] / 65535;
          }
          return data;
        };
      case Uint8Array:
        return (data) => {
          for (let i = 0; i < stride; i++) {
            data[i] = data[i] / 255;
          }
          return data;
        };
      case Int32Array:
        return (data) => {
          for (let i = 0; i < stride; i++) {
            data[i] = Math.max(data[i] / 2147483647, -1);
          }
          return data;
        };
      case Int16Array:
        return (data) => {
          for (let i = 0; i < stride; i++) {
            data[i] = Math.max(data[i] / 32767, -1);
          }
          return data;
        };
      case Int8Array:
        return (data) => {
          for (let i = 0; i < stride; i++) {
            data[i] = Math.max(data[i] / 127, -1);
          }
          return data;
        };
      default:
        throw new Error("Invalid component type.");
    }
  }

  class glTFLinear {
    constructor(_output, _stride) {
      this._output = _output;
      this._stride = _stride;
      this._data = new Float32Array(_stride);
      this._denormalize = getDenormalizeFunction(this._output, this._stride);
    }
    interpolate(frame, position) {
      let pos1 = (frame + 0) * this._stride;
      let pos2 = (frame + 1) * this._stride;
      for (let i = 0; i < this._stride; i++) {
        if (this._output.length > pos2) {
          this._data[i] = (1 - position) * this._output[pos1 + i] + position * this._output[pos2 + i];
        } else {
          this._data[i] = this._output[pos1 + i];
        }
      }
      return this._denormalize(this._data);
    }
  }

  class glTFCubicSpline {
    constructor(_input, _output, _stride) {
      this._input = _input;
      this._output = _output;
      this._stride = _stride;
      this._data = new Float32Array(_stride);
      this._denormalize = getDenormalizeFunction(this._output, this._stride);
    }
    interpolate(frame, position) {
      const diff = this._input[frame + 1] - this._input[frame];
      const pos1 = (frame + 0) * this._stride * 3;
      const pos2 = (frame + 1) * this._stride * 3;
      for (let i = 0; i < this._stride; i++) {
        this._data[i] = glTFCubicSpline.calculate(
          position,
          this._output[pos1 + i + 1 * this._stride],
          this._output[pos2 + i + 1 * this._stride],
          diff * this._output[pos2 + i],
          diff * this._output[pos1 + i + 2 * this._stride]
        );
      }
      return this._denormalize(this._data);
    }
    static calculate(t, p0, p1, m0, m1) {
      return (2 * t ** 3 - 3 * t ** 2 + 1) * p0 + (t ** 3 - 2 * t ** 2 + t) * m0 + (-2 * t ** 3 + 3 * t ** 2) * p1 + (t ** 3 - t ** 2) * m1;
    }
  }

  class glTFStep {
    constructor(_output, _stride) {
      this._output = _output;
      this._stride = _stride;
      this._data = new Float32Array(_stride);
      this._denormalize = getDenormalizeFunction(this._output, this._stride);
    }
    interpolate(frame) {
      for (let i = 0; i < this._stride; i++) {
        this._data[i] = this._output[frame * this._stride + i];
      }
      return this._denormalize(this._data);
    }
  }

  class glTFInterpolationFactory {
    static create(type, input, output, stride) {
      switch (type) {
        case "LINEAR": {
          return new glTFLinear(output, stride);
        }
        case "CUBICSPLINE": {
          return new glTFCubicSpline(input, output, stride);
        }
        case "STEP": {
          return new glTFStep(output, stride);
        }
      }
      throw new Error(`PIXI3D: Unknown interpolation type "${type}"`);
    }
  }

  class glTFChannel {
    constructor(input, interpolation) {
      this._position = 0;
      this._frame = 0;
      this._input = input;
      this._interpolation = interpolation;
    }
    get position() {
      return this._position;
    }
    set position(value) {
      this.setPosition(value);
    }
    get duration() {
      return this._input[this._input.length - 1];
    }
    get frame() {
      return this._frame;
    }
    get length() {
      return this._input.length;
    }
    setPosition(position) {
      this._position = position;
      this._frame = this.calculateFrame(this._position);
      this.updateTarget(
        this._interpolation.interpolate(
          this._frame,
          this.calculateFramePosition(this._frame, this._position)
        )
      );
    }
    update(delta) {
      this.position += delta;
    }
    calculateFramePosition(frame, position) {
      if (frame === this._input.length - 1) {
        return 1;
      }
      return (position - this._input[frame]) / (this._input[frame + 1] - this._input[frame]);
    }
    calculateFrame(position) {
      if (position < this._input[0]) {
        return 0;
      }
      for (let i = 0; i < this._input.length - 1; i++) {
        if (position >= this._input[i] && position < this._input[i + 1]) {
          return i;
        }
      }
      return this._input.length - 1;
    }
  }

  class glTFRotation extends glTFChannel {
    constructor(transform, input, interpolation) {
      super(input, interpolation);
      this._transform = transform;
    }
    updateTarget(data) {
      this._transform.rotationQuaternion.set(data[0], data[1], data[2], data[3]);
    }
  }

  class glTFScale extends glTFChannel {
    constructor(transform, input, interpolation) {
      super(input, interpolation);
      this._transform = transform;
    }
    updateTarget(data) {
      this._transform.scale.set(data[0], data[1], data[2]);
    }
  }

  class glTFSphericalLinear {
    constructor(_output) {
      this._output = _output;
      this._data = new Float32Array(4);
    }
    interpolate(frame, position) {
      let pos1 = (frame + 0) * 4;
      let pos2 = (frame + 1) * 4;
      let a = Quat.set(
        this._output[pos1],
        this._output[pos1 + 1],
        this._output[pos1 + 2],
        this._output[pos1 + 3],
        new Float32Array(4)
      );
      if (this._output.length <= pos2) {
        return Quat.normalize(a, this._data);
      }
      let b = Quat.set(
        this._output[pos2],
        this._output[pos2 + 1],
        this._output[pos2 + 2],
        this._output[pos2 + 3],
        new Float32Array(4)
      );
      return Quat.normalize(
        Quat.slerp(a, b, position, this._data),
        this._data
      );
    }
  }

  class glTFTranslation extends glTFChannel {
    constructor(transform, input, interpolation) {
      super(input, interpolation);
      this._transform = transform;
    }
    updateTarget(data) {
      this._transform.position.set(data[0], data[1], data[2]);
    }
  }

  class glTFWeights extends glTFChannel {
    constructor(weights, input, interpolation) {
      super(input, interpolation);
      this._weights = weights;
    }
    updateTarget(data) {
      for (let i = 0; i < data.length; i++) {
        this._weights[i] = data[i];
      }
    }
  }

  class glTFChannelFactory {
    static create(input, output, interpolation, path, target) {
      if (path === "translation") {
        return new glTFTranslation(
          target.transform,
          input,
          glTFInterpolationFactory.create(interpolation, input, output, 3)
        );
      }
      if (path === "scale") {
        return new glTFScale(
          target.transform,
          input,
          glTFInterpolationFactory.create(interpolation, input, output, 3)
        );
      }
      if (path === "rotation") {
        if (interpolation === "LINEAR") {
          return new glTFRotation(
            target.transform,
            input,
            new glTFSphericalLinear(output)
          );
        }
        return new glTFRotation(
          target.transform,
          input,
          glTFInterpolationFactory.create(interpolation, input, output, 4)
        );
      }
      if (path === "weights") {
        let weights = target.children[0].targetWeights;
        if (!weights) {
          return void 0;
        }
        return new glTFWeights(
          weights,
          input,
          glTFInterpolationFactory.create(interpolation, input, output, weights.length)
        );
      }
      throw new Error(`PIXI3D: Unknown channel path "${path}"`);
    }
  }

  class glTFParser {
    constructor(asset, materialFactory) {
      var _a;
      this._asset = asset;
      this._materialFactory = materialFactory || new StandardMaterialFactory();
      this._descriptor = this._asset.descriptor;
      if (asset.textures.length === 0) {
        for (let i = 0; i < ((_a = this._descriptor.textures) == null ? void 0 : _a.length); i++) {
          asset.textures.push(this.parseTexture(i));
        }
      }
    }
    static createModel(asset, materialFactory) {
      return new glTFParser(asset, materialFactory).parseModel();
    }
    static createMesh(asset, materialFactory, mesh = 0) {
      return new glTFParser(asset, materialFactory).parseMesh(mesh);
    }
    parseBuffer(accessor) {
      if (accessor === void 0) {
        return void 0;
      }
      if (typeof accessor === "number") {
        accessor = this._asset.descriptor.accessors[accessor];
      }
      let bufferView = this._descriptor.bufferViews[accessor.bufferView || 0];
      let offset = accessor.byteOffset || 0;
      if (bufferView.byteOffset !== void 0) {
        offset += bufferView.byteOffset;
      }
      let size = accessor.count * componentCount[accessor.type];
      if (bufferView.byteStride !== void 0 && bufferView.byteStride !== 0) {
        size = bufferView.byteStride / componentSize[accessor.componentType] * (accessor.count - 1) + componentCount[accessor.type];
      }
      let buffer = this._asset.buffers[bufferView.buffer];
      const normalized = accessor.normalized === true;
      return glTFAttribute.from(
        accessor.componentType,
        componentCount[accessor.type],
        buffer,
        offset,
        size,
        bufferView.byteStride,
        normalized,
        accessor.min,
        accessor.max
      );
    }
    parseAnimation(animation, nodes) {
      if (typeof animation === "number") {
        animation = this._asset.descriptor.animations[animation];
      }
      let channels = [];
      for (let channel of animation.channels) {
        let sampler = animation.samplers[channel.sampler];
        let input = this.parseBuffer(sampler.input);
        if (input === void 0) {
          continue;
        }
        let output = this.parseBuffer(sampler.output);
        if (output === void 0) {
          continue;
        }
        let animationChannel = glTFChannelFactory.create(
          input.buffer,
          output.buffer,
          sampler.interpolation || "LINEAR",
          channel.target.path,
          nodes[channel.target.node]
        );
        if (animationChannel) {
          channels.push(animationChannel);
        }
      }
      return new glTFAnimation(channels, animation.name);
    }
    parseMaterial(material) {
      if (typeof material === "number") {
        material = this._asset.descriptor.materials[material];
      }
      let result = new glTFMaterial();
      if (!material) {
        return this._materialFactory.create(result);
      }
      if (material.occlusionTexture !== void 0) {
        result.occlusionTexture = this._asset.textures[material.occlusionTexture.index].clone();
        result.occlusionTexture.strength = material.occlusionTexture.strength;
        result.occlusionTexture.texCoord = material.occlusionTexture.texCoord;
        if (material.occlusionTexture.extensions && material.occlusionTexture.extensions.KHR_texture_transform) {
          result.occlusionTexture.transform = material.occlusionTexture.extensions.KHR_texture_transform;
          if (material.occlusionTexture.extensions.KHR_texture_transform.texCoord !== void 0) {
            result.occlusionTexture.texCoord = material.occlusionTexture.extensions.KHR_texture_transform.texCoord;
          }
        }
      }
      if (material.normalTexture !== void 0) {
        result.normalTexture = this._asset.textures[material.normalTexture.index].clone();
        result.normalTexture.scale = material.normalTexture.scale || 1;
        result.normalTexture.texCoord = material.normalTexture.texCoord;
        if (material.normalTexture.extensions && material.normalTexture.extensions.KHR_texture_transform) {
          result.normalTexture.transform = material.normalTexture.extensions.KHR_texture_transform;
          if (material.normalTexture.extensions.KHR_texture_transform.texCoord !== void 0) {
            result.normalTexture.texCoord = material.normalTexture.extensions.KHR_texture_transform.texCoord;
          }
        }
      }
      if (material.emissiveTexture !== void 0) {
        result.emissiveTexture = this._asset.textures[material.emissiveTexture.index].clone();
        result.emissiveTexture.texCoord = material.emissiveTexture.texCoord;
        if (material.emissiveTexture.extensions && material.emissiveTexture.extensions.KHR_texture_transform) {
          result.emissiveTexture.transform = material.emissiveTexture.extensions.KHR_texture_transform;
          if (material.emissiveTexture.extensions.KHR_texture_transform.texCoord !== void 0) {
            result.emissiveTexture.texCoord = material.emissiveTexture.extensions.KHR_texture_transform.texCoord;
          }
        }
      }
      if (material.doubleSided !== void 0) {
        result.doubleSided = material.doubleSided;
      }
      if (material.emissiveFactor) {
        result.emissiveFactor = material.emissiveFactor;
      }
      if (material.alphaMode) {
        result.alphaMode = material.alphaMode;
      }
      if (material.alphaCutoff !== void 0) {
        result.alphaCutoff = material.alphaCutoff;
      }
      let pbr = material.pbrMetallicRoughness;
      if ((pbr == null ? void 0 : pbr.metallicRoughnessTexture) !== void 0) {
        result.metallicRoughnessTexture = this._asset.textures[pbr.metallicRoughnessTexture.index].clone();
        result.metallicRoughnessTexture.texCoord = pbr.metallicRoughnessTexture.texCoord;
        if (pbr.metallicRoughnessTexture.extensions && pbr.metallicRoughnessTexture.extensions.KHR_texture_transform) {
          result.metallicRoughnessTexture.transform = pbr.metallicRoughnessTexture.extensions.KHR_texture_transform;
          if (pbr.metallicRoughnessTexture.extensions.KHR_texture_transform.texCoord !== void 0) {
            result.metallicRoughnessTexture.texCoord = pbr.metallicRoughnessTexture.extensions.KHR_texture_transform.texCoord;
          }
        }
      }
      if (pbr == null ? void 0 : pbr.baseColorFactor) {
        result.baseColor = pbr.baseColorFactor;
      }
      if ((pbr == null ? void 0 : pbr.baseColorTexture) !== void 0) {
        result.baseColorTexture = this._asset.textures[pbr.baseColorTexture.index].clone();
        result.baseColorTexture.texCoord = pbr.baseColorTexture.texCoord;
        if (pbr.baseColorTexture.extensions && pbr.baseColorTexture.extensions.KHR_texture_transform) {
          result.baseColorTexture.transform = pbr.baseColorTexture.extensions.KHR_texture_transform;
          if (pbr.baseColorTexture.extensions.KHR_texture_transform.texCoord !== void 0) {
            result.baseColorTexture.texCoord = pbr.baseColorTexture.extensions.KHR_texture_transform.texCoord;
          }
        }
      }
      if ((pbr == null ? void 0 : pbr.metallicFactor) !== void 0) {
        result.metallic = pbr.metallicFactor;
      }
      if ((pbr == null ? void 0 : pbr.roughnessFactor) !== void 0) {
        result.roughness = pbr.roughnessFactor;
      }
      if (material.extensions) {
        result.unlit = material.extensions["KHR_materials_unlit"] !== void 0;
      }
      return this._materialFactory.create(result);
    }
    parseTexture(index) {
      const texture = this._descriptor.textures[index];
      const image = this._asset.images[texture.source];
      const result = new PixiCore.Texture(new PixiCore.BaseTexture(image.baseTexture.resource, {
        wrapMode: constants.WRAP_MODES.REPEAT,
        alphaMode: constants.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
      }));
      if (this._descriptor.samplers && texture.sampler !== void 0) {
        const sampler = this._descriptor.samplers[texture.sampler];
        switch (sampler.wrapS) {
          case 10497:
            result.baseTexture.wrapMode = constants.WRAP_MODES.REPEAT;
            break;
          case 33648:
            result.baseTexture.wrapMode = constants.WRAP_MODES.MIRRORED_REPEAT;
            break;
          case 33071:
            result.baseTexture.wrapMode = constants.WRAP_MODES.CLAMP;
            break;
        }
      }
      return result;
    }
    parseMesh(mesh) {
      if (typeof mesh === "number") {
        mesh = this._asset.descriptor.meshes[mesh];
      }
      let weights = mesh.weights || [];
      return mesh.primitives.map((primitive) => {
        return Object.assign(this.parsePrimitive(primitive), {
          name: mesh.name,
          targetWeights: weights
        });
      });
    }
    parseSkin(skin, target, nodes) {
      if (typeof skin === "number") {
        skin = this._asset.descriptor.skins[skin];
      }
      return new Skin(
        target,
        skin.joints.map((joint) => nodes[joint])
      );
    }
    parsePrimitive(primitive) {
      let { attributes, targets } = primitive;
      let geometry = Object.assign(new MeshGeometry3D(), {
        indices: this.parseBuffer(primitive.indices),
        positions: this.parseBuffer(attributes["POSITION"]),
        normals: this.parseBuffer(attributes["NORMAL"]),
        tangents: this.parseBuffer(attributes["TANGENT"]),
        joints: this.parseBuffer(attributes["JOINTS_0"]),
        weights: this.parseBuffer(attributes["WEIGHTS_0"]),
        colors: this.parseBuffer(attributes["COLOR_0"])
      });
      for (let i = 0; true; i++) {
        let buffer = this.parseBuffer(attributes[`TEXCOORD_${i}`]);
        if (buffer === void 0) {
          break;
        }
        geometry.uvs = geometry.uvs || [];
        geometry.uvs.push(buffer);
      }
      if (targets) {
        for (let i = 0; i < targets.length; i++) {
          geometry.targets = geometry.targets || [];
          geometry.targets.push({
            positions: this.parseBuffer(targets[i]["POSITION"]),
            normals: this.parseBuffer(targets[i]["NORMAL"]),
            tangents: this.parseBuffer(targets[i]["TANGENT"])
          });
        }
      }
      let material;
      if (primitive.material !== void 0) {
        material = this.parseMaterial(
          this._asset.descriptor.materials[primitive.material]
        );
      } else {
        material = this.parseMaterial();
      }
      return new Mesh3D(geometry, material);
    }
    parseNode(index) {
      const node = this._asset.descriptor.nodes[index];
      let joint;
      for (let skin of this._asset.descriptor.skins || []) {
        const i = skin.joints.indexOf(index);
        if (i >= 0) {
          const inverseBindMatrices = this.parseBuffer(skin.inverseBindMatrices);
          const inverseBindMatrix = inverseBindMatrices == null ? void 0 : inverseBindMatrices.buffer.slice(i * 16, i * 16 + 16);
          joint = Object.assign(new Joint(inverseBindMatrix), {
            name: node.name
          });
        }
      }
      let container = joint || Object.assign(new Container3D(), {
        name: node.name
      });
      if (node.translation) {
        container.position.set(
          node.translation[0],
          node.translation[1],
          node.translation[2]
        );
      }
      if (node.rotation) {
        container.rotationQuaternion.set(
          node.rotation[0],
          node.rotation[1],
          node.rotation[2],
          node.rotation[3]
        );
      }
      if (node.scale) {
        container.scale.set(node.scale[0], node.scale[1], node.scale[2]);
      }
      if (node.matrix) {
        container.transform.setFromMatrix(new Matrix4x4(node.matrix));
      }
      return container;
    }
    parseModel() {
      let nodes = this._descriptor.nodes.map((n, i) => {
        return this.parseNode(i);
      });
      let scene = this._descriptor.scenes[this._asset.descriptor.scene || 0];
      let model = new Model();
      let createHierarchy = (parent, node) => {
        let mesh = this._asset.descriptor.nodes[node].mesh;
        let skin;
        if (this._asset.descriptor.nodes[node].skin !== void 0) {
          skin = this.parseSkin(this._asset.descriptor.nodes[node].skin, nodes[node], nodes);
        }
        if (mesh !== void 0) {
          for (let primitive of this.parseMesh(mesh)) {
            model.meshes.push(nodes[node].addChild(primitive));
            model.meshes[model.meshes.length - 1].skin = skin;
          }
        }
        parent.addChild(nodes[node]);
        if (!this._asset.descriptor.nodes[node].children) {
          return;
        }
        for (let child of this._asset.descriptor.nodes[node].children) {
          createHierarchy(nodes[node], child);
        }
      };
      for (let node of scene.nodes) {
        createHierarchy(model, node);
      }
      if (this._asset.descriptor.animations) {
        for (let animation of this._asset.descriptor.animations) {
          model.animations.push(this.parseAnimation(animation, nodes));
        }
      }
      return model;
    }
  }
  const componentCount = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };
  const componentSize = {
    [5120]: 1,
    [5121]: 1,
    [5122]: 2,
    [5123]: 2,
    [5125]: 4,
    [5126]: 4
  };

  function clone(node, parent, meshes) {
    for (let child of node.children) {
      if (child instanceof Mesh3D) {
        const mesh = child.createInstance();
        mesh.name = child.name;
        meshes.push(parent.addChild(mesh));
      } else if (child instanceof Container3D) {
        const copy = parent.addChild(new Container3D());
        copy.name = node.name;
        copy.position = child.position;
        copy.scale = child.scale;
        copy.rotationQuaternion = child.rotationQuaternion;
        clone(child, copy, meshes);
      }
    }
  }
  class InstancedModel extends Container3D {
    constructor(model) {
      super();
      this.meshes = [];
      clone(model, this, this.meshes);
    }
  }

  class Model extends Container3D {
    constructor() {
      super(...arguments);
      this.animations = [];
      this.meshes = [];
    }
    static from(source, materialFactory) {
      return glTFParser.createModel(source, materialFactory);
    }
    createInstance() {
      return new InstancedModel(this);
    }
    getBoundingBox() {
      this.updateTransform();
      let aabb = new AABB();
      let mesh = this.meshes[0].getBoundingBox();
      if (mesh) {
        aabb.min = mesh.min;
        aabb.max = mesh.max;
      }
      for (let i = 1; i < this.meshes.length; i++) {
        let mesh2 = this.meshes[i].getBoundingBox();
        if (mesh2) {
          aabb.encapsulate(mesh2.min);
          aabb.encapsulate(mesh2.max);
        }
      }
      return aabb;
    }
  }

  class Light extends Container3D {
    constructor() {
      super(...arguments);
      this.type = LightType.point;
      this.color = new Color(1, 1, 1);
      this.range = 10;
      this.intensity = 10;
      this.innerConeAngle = 0;
      this.outerConeAngle = 45;
    }
  }

  class Fog {
    constructor(near = 5, far = 50, color = new Color(1, 1, 1)) {
      this.near = near;
      this.far = far;
      this.color = color;
    }
  }

  class MaterialRenderPass {
    constructor(renderer, name) {
      this.renderer = renderer;
      this.name = name;
      this.clearColor = new Color(0, 0, 0, 0);
    }
    get renderTexture() {
      return this._renderTexture;
    }
    set renderTexture(value) {
      this._renderTexture = value;
    }
    clear() {
      if (this._renderTexture && this.clearColor) {
        const current = this.renderer.renderTexture.current;
        this.renderer.renderTexture.bind(this._renderTexture);
        this.renderer.renderTexture.clear(Array.from(this.clearColor.rgba));
        this.renderer.renderTexture.bind(current || void 0);
      }
    }
    render(meshes) {
      const current = this.renderer.renderTexture.current;
      if (this._renderTexture) {
        this.renderer.renderTexture.bind(this._renderTexture);
      }
      for (let mesh of meshes) {
        if (mesh.material) {
          mesh.material.render(mesh, this.renderer);
        }
      }
      if (this._renderTexture) {
        this.renderer.renderTexture.bind(current || void 0);
      }
    }
  }

  var Shader$9 = {"source":"#version VERSION\n\nVERT_IN vec3 a_Position;\nVERT_IN vec2 a_UV1;\n\nVERT_OUT vec2 v_UV1;\n\nvoid main() {\n  v_UV1 = a_UV1;\n  gl_Position = vec4(a_Position, 1.0);\n}"};

  var Shader$8 = {"source":"#version VERSION\n\n#define FEATURES\n\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n\n#ifdef WEBGL2\n  out vec4 FRAG_COLOR;\n#endif\n\nFRAG_IN vec2 v_UV1;\n\nuniform vec2 u_BlurScale;\nuniform sampler2D u_FilterSampler;\n\nvoid main() {\n  vec4 color = vec4(0.0);\n\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(-3.0) * u_BlurScale.xy)) * (1.0/64.0);\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(-2.0) * u_BlurScale.xy)) * (6.0/64.0);\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(-1.0) * u_BlurScale.xy)) * (15.0/64.0);\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(+0.0) * u_BlurScale.xy)) * (20.0/64.0);\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(+1.0) * u_BlurScale.xy)) * (15.0/64.0);\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(+2.0) * u_BlurScale.xy)) * (6.0/64.0);\n  color += texture2D(u_FilterSampler, v_UV1 + (vec2(+3.0) * u_BlurScale.xy)) * (1.0/64.0);\n\n  FRAG_COLOR = color;\n}"};

  class ShadowFilter {
    constructor(renderer) {
      this.renderer = renderer;
      this._mesh = Mesh3D.createQuad();
      this._gaussianBlurShader = new MeshShader(PixiCore.Program.from(
        StandardShaderSource.build(Shader$9.source, [], renderer),
        StandardShaderSource.build(Shader$8.source, [], renderer)
      ));
    }
    applyGaussianBlur(light) {
      this.applyBlurScale(
        light.shadowTexture,
        light.filterTexture,
        new Float32Array([0, light.softness / light.shadowTexture.height])
      );
      this.applyBlurScale(
        light.filterTexture,
        light.shadowTexture,
        new Float32Array([light.softness / light.shadowTexture.width, 0])
      );
    }
    applyBlurScale(input, output, scale) {
      this.renderer.renderTexture.bind(output);
      this.renderer.renderTexture.clear();
      this._gaussianBlurShader.uniforms.u_FilterSampler = input;
      this._gaussianBlurShader.uniforms.u_BlurScale = scale;
      this._gaussianBlurShader.render(this._mesh, this.renderer);
      this.renderer.renderTexture.bind(void 0);
    }
  }

  var Shader$7 = {"source":"#version VERSION\n\n#define FEATURES\n\nvec4 _texture(sampler2D sampler, vec2 coord)\n{\n#ifdef WEBGL2\n    return texture(sampler, coord);\n#else\n    return texture2D(sampler, coord);\n#endif\n}\n\nvec4 _texture(samplerCube sampler, vec3 coord)\n{\n#ifdef WEBGL2\n    return texture(sampler, coord);\n#else\n    return textureCube(sampler, coord);\n#endif\n}\n\nVERT_IN vec3 a_Position;\n\n#ifdef USE_SKINNING\n  VERT_IN vec4 a_Joint1;\n  VERT_IN vec4 a_Weight1;\n#endif\n\nuniform mat4 u_ViewProjectionMatrix;\nuniform mat4 u_ModelMatrix;\n\n#ifdef USE_SKINNING\n  #ifdef USE_SKINNING_TEXTURE\n    uniform sampler2D u_jointMatrixSampler;\n  #else\n    uniform mat4 u_jointMatrix[MAX_JOINT_COUNT];\n  #endif\n#endif\n\n#ifdef USE_INSTANCING\n  VERT_IN vec4 a_ModelMatrix0;\n  VERT_IN vec4 a_ModelMatrix1;\n  VERT_IN vec4 a_ModelMatrix2;\n  VERT_IN vec4 a_ModelMatrix3;\n#endif\n\n// these offsets assume the texture is 4 pixels across\n#define ROW0_U ((0.5 + 0.0) / 4.0)\n#define ROW1_U ((0.5 + 1.0) / 4.0)\n#define ROW2_U ((0.5 + 2.0) / 4.0)\n#define ROW3_U ((0.5 + 3.0) / 4.0)\n\n#ifdef USE_SKINNING\nmat4 getJointMatrix(float boneNdx) {\n  #ifdef USE_SKINNING_TEXTURE\n    float v = (boneNdx + 0.5) / float(MAX_JOINT_COUNT);\n    return mat4(\n      _texture(u_jointMatrixSampler, vec2(ROW0_U, v)), \n      _texture(u_jointMatrixSampler, vec2(ROW1_U, v)), \n      _texture(u_jointMatrixSampler, vec2(ROW2_U, v)), \n      _texture(u_jointMatrixSampler, vec2(ROW3_U, v))\n    );\n  #else\n    return u_jointMatrix[int(boneNdx)];\n  #endif\n}\n\nmat4 getSkinningMatrix() {\n  mat4 skin = mat4(0);\n  skin += \n    a_Weight1.x * getJointMatrix(a_Joint1.x) +\n    a_Weight1.y * getJointMatrix(a_Joint1.y) +\n    a_Weight1.z * getJointMatrix(a_Joint1.z) +\n    a_Weight1.w * getJointMatrix(a_Joint1.w);\n  return skin;\n}\n#endif\n\nvoid main() {\n  mat4 modelMatrix = u_ModelMatrix;\n  #ifdef USE_INSTANCING\n    modelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\n  #endif\n  vec4 pos = vec4(a_Position, 1.0);\n  #ifdef USE_SKINNING\n    pos = getSkinningMatrix() * pos;\n  #endif\n  gl_Position = u_ViewProjectionMatrix * modelMatrix * pos;\n}"};

  var Shader$6 = {"source":"#version VERSION\n\n#define FEATURES\n\n#if defined(WEBGL1)\n  #extension GL_OES_standard_derivatives : enable\n#endif\n\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n\n#ifdef WEBGL2\n  out vec4 FRAG_COLOR;\n#endif\n\nvoid main() {\n  float depth = gl_FragCoord.z;\n  float dx = 0.0;\n  float dy = 0.0;\n\n  #if defined(WEBGL2) || defined(GL_OES_standard_derivatives)\n    dx = dFdx(depth);\n    dy = dFdy(depth);\n  #endif\n\n  float moment2 = depth * depth + 0.25 * (dx * dx + dy * dy);\n  FRAG_COLOR = vec4(1.0 - depth, 1.0 - moment2, 0.0, 0.0);\n}"};

  class ShadowShaderInstancing {
    constructor() {
      this._maxInstances = 20;
      this._modelMatrix = [
        new PixiCore.Buffer(),
        new PixiCore.Buffer(),
        new PixiCore.Buffer(),
        new PixiCore.Buffer()
      ];
      this.expandBuffers(this._maxInstances);
    }
    expandBuffers(instanceCount) {
      while (instanceCount > this._maxInstances) {
        this._maxInstances += Math.floor(this._maxInstances * 0.5);
      }
      for (let i = 0; i < 4; i++) {
        this._modelMatrix[i].update(new Float32Array(4 * this._maxInstances));
      }
    }
    updateBuffers(instances) {
      if (instances.length > this._maxInstances) {
        this.expandBuffers(instances.length);
      }
      for (let i = 0; i < instances.length; i++) {
        const model = instances[i].worldTransform.array;
        for (let j = 0; j < 4; j++) {
          this._modelMatrix[j].data.set(model.slice(j * 4, j * 4 + 4), i * 4);
        }
      }
      for (let i = 0; i < 4; i++) {
        this._modelMatrix[i].update();
      }
    }
    addGeometryAttributes(geometry) {
      for (let i = 0; i < 4; i++) {
        geometry.addAttribute(
          `a_ModelMatrix${i}`,
          this._modelMatrix[i],
          4,
          false,
          void 0,
          0,
          void 0,
          true
        );
      }
    }
  }

  var ShadowMaterialFeatureSet;
  ((ShadowMaterialFeatureSet2) => {
    function build(renderer, features = []) {
      if (renderer.context.webGLVersion === 1) {
        features.push("WEBGL1 1");
      }
      if (renderer.context.webGLVersion === 2) {
        features.push("WEBGL2 1");
      }
      return features;
    }
    ShadowMaterialFeatureSet2.build = build;
  })(ShadowMaterialFeatureSet || (ShadowMaterialFeatureSet = {}));

  class ShadowShader extends MeshShader {
    constructor(renderer, features = []) {
      features = ShadowMaterialFeatureSet.build(renderer, features);
      super(PixiCore.Program.from(
        StandardShaderSource.build(Shader$7.source, features, renderer),
        StandardShaderSource.build(Shader$6.source, features, renderer)
      ));
      this._instancing = new ShadowShaderInstancing();
    }
    get maxSupportedJoints() {
      return 0;
    }
    createShaderGeometry(geometry, instanced) {
      let result = new PixiCore.Geometry();
      if (geometry.indices) {
        if (geometry.indices.buffer.BYTES_PER_ELEMENT === 1) {
          result.addIndex(new PixiCore.Buffer(new Uint16Array(geometry.indices.buffer)));
        } else {
          result.addIndex(new PixiCore.Buffer(geometry.indices.buffer));
        }
      }
      if (geometry.positions) {
        result.addAttribute(
          "a_Position",
          new PixiCore.Buffer(geometry.positions.buffer),
          3,
          false,
          geometry.positions.componentType,
          geometry.positions.stride
        );
      }
      if (instanced) {
        this._instancing.addGeometryAttributes(result);
      }
      return result;
    }
    get name() {
      return "shadow-shader";
    }
    render(mesh, renderer, state) {
      if (mesh.instances.length > 0) {
        const filteredInstances = mesh.instances.filter((instance) => instance.worldVisible && instance.renderable);
        if (filteredInstances.length === 0) {
          return;
        }
        this._instancing.updateBuffers(filteredInstances);
      }
      super.render(mesh, renderer, state);
    }
    updateUniforms(mesh, shadowCastingLight) {
      this.uniforms.u_ModelMatrix = mesh.worldTransform.array;
      this.uniforms.u_ViewProjectionMatrix = shadowCastingLight.lightViewProjection;
    }
  }

  class SkinningShader extends ShadowShader {
    constructor(renderer) {
      const maxJointCount = SkinningShader.getMaxJointCount(renderer) - 1;
      super(renderer, ["USE_SKINNING 1", "MAX_JOINT_COUNT " + maxJointCount]);
      this._maxSupportedJoints = maxJointCount;
    }
    get maxSupportedJoints() {
      return this._maxSupportedJoints;
    }
    static getMaxJointCount(renderer) {
      let uniformsRequiredForOtherFeatures = 8;
      let availableVertexUniforms = Capabilities.getMaxVertexUniformVectors(renderer) - uniformsRequiredForOtherFeatures;
      let uniformsRequiredPerJoint = 4;
      return Math.floor(availableVertexUniforms / uniformsRequiredPerJoint);
    }
    createShaderGeometry(geometry, instanced) {
      let result = super.createShaderGeometry(geometry, instanced);
      if (geometry.joints) {
        result.addAttribute(
          "a_Joint1",
          new PixiCore.Buffer(geometry.joints.buffer),
          4,
          false,
          geometry.joints.componentType,
          geometry.joints.stride
        );
      }
      if (geometry.weights) {
        result.addAttribute(
          "a_Weight1",
          new PixiCore.Buffer(geometry.weights.buffer),
          4,
          false,
          geometry.weights.componentType,
          geometry.weights.stride
        );
      }
      return result;
    }
    get name() {
      return "skinned-shadow-shader";
    }
    updateUniforms(mesh, shadowCastingLight) {
      super.updateUniforms(mesh, shadowCastingLight);
      if (!mesh.skin) {
        return;
      }
      this.uniforms.u_jointMatrix = mesh.skin.jointMatrices;
    }
  }

  const MAX_SUPPORTED_JOINTS = 256;
  class TextureShader extends ShadowShader {
    constructor(renderer) {
      super(renderer, [
        "USE_SKINNING 1",
        "USE_SKINNING_TEXTURE 1",
        "MAX_JOINT_COUNT " + MAX_SUPPORTED_JOINTS
      ]);
      this._jointMatrixTexture = new StandardMaterialMatrixTexture(MAX_SUPPORTED_JOINTS);
    }
    static isSupported(renderer) {
      return StandardMaterialMatrixTexture.isSupported(renderer);
    }
    get maxSupportedJoints() {
      return MAX_SUPPORTED_JOINTS;
    }
    createShaderGeometry(geometry, instanced) {
      let result = super.createShaderGeometry(geometry, instanced);
      if (geometry.joints) {
        result.addAttribute(
          "a_Joint1",
          new PixiCore.Buffer(geometry.joints.buffer),
          4,
          false,
          geometry.joints.componentType,
          geometry.joints.stride
        );
      }
      if (geometry.weights) {
        result.addAttribute(
          "a_Weight1",
          new PixiCore.Buffer(geometry.weights.buffer),
          4,
          false,
          geometry.weights.componentType,
          geometry.weights.stride
        );
      }
      return result;
    }
    get name() {
      return "skinned-shadow-shader";
    }
    updateUniforms(mesh, shadowCastingLight) {
      super.updateUniforms(mesh, shadowCastingLight);
      if (!mesh.skin) {
        return;
      }
      this._jointMatrixTexture.updateBuffer(mesh.skin.jointMatrices);
      this.uniforms.u_jointMatrixSampler = this._jointMatrixTexture;
    }
  }

  class ShadowRenderer {
    constructor(renderer) {
      this.renderer = renderer;
      this._state = Object.assign(new PixiCore.State(), {
        depthTest: true,
        clockwiseFrontFace: false,
        culling: true,
        blendMode: constants.BLEND_MODES.NONE
      });
      this._shadowShader = new ShadowShader(this.renderer);
      this._instancedShadowShader = new ShadowShader(this.renderer, ["USE_INSTANCING 1"]);
    }
    getSkinningShader() {
      if (this._textureShader || this._skinningShader) {
        return this._textureShader || this._skinningShader;
      }
      if (TextureShader.isSupported(this.renderer)) {
        this._textureShader = new TextureShader(this.renderer);
      } else {
        exports.Debug.warn(Message.meshVertexSkinningFloatingPointTexturesNotSupported);
        this._skinningShader = new SkinningShader(this.renderer);
      }
      return this._textureShader || this._skinningShader;
    }
    render(mesh, shadowCastingLight) {
      const useInstances = mesh.instances.length > 0;
      let shader = useInstances ? this._instancedShadowShader : this._shadowShader;
      if (mesh.skin) {
        let skinningShader = this.getSkinningShader();
        if (skinningShader && mesh.skin.joints.length > skinningShader.maxSupportedJoints) {
          exports.Debug.error(Message.meshVertexSkinningNumberOfJointsNotSupported, {
            joints: mesh.skin.joints.length,
            maxJoints: skinningShader.maxSupportedJoints
          });
        } else {
          shader = skinningShader;
        }
      }
      if (shader) {
        shader.updateUniforms(mesh, shadowCastingLight);
        shader.render(mesh, this.renderer, this._state);
      }
    }
  }

  class ShadowRenderPass {
    constructor(renderer, name = "shadow") {
      this.renderer = renderer;
      this.name = name;
      this._lights = [];
      this._filter = new ShadowFilter(renderer);
      this._shadow = new ShadowRenderer(renderer);
    }
    addShadowCastingLight(shadowCastingLight) {
      if (this._lights.indexOf(shadowCastingLight) < 0) {
        this._lights.push(shadowCastingLight);
      }
    }
    removeShadowCastingLight(shadowCastingLight) {
      const index = this._lights.indexOf(shadowCastingLight);
      if (index >= 0) {
        this._lights.splice(index, 1);
      }
    }
    clear() {
      for (let shadowCastingLight of this._lights) {
        shadowCastingLight.clear();
      }
    }
    render(meshes) {
      if (meshes.length === 0 || this._lights.length === 0) {
        return;
      }
      const current = this.renderer.renderTexture.current;
      for (let shadowCastingLight of this._lights) {
        this.renderer.renderTexture.bind(shadowCastingLight.shadowTexture);
        shadowCastingLight.updateLightViewProjection();
        for (let mesh of meshes) {
          this._shadow.render(mesh, shadowCastingLight);
        }
        if (shadowCastingLight.softness > 0) {
          this._filter.applyGaussianBlur(shadowCastingLight);
        }
      }
      this.renderer.renderTexture.bind(current || void 0);
    }
  }

  class SpriteBatchGeometry extends PixiCore.BatchGeometry {
    constructor() {
      super();
      this.addAttribute("aMatrix0", this._buffer, 4, false, constants.TYPES.FLOAT);
      this.addAttribute("aMatrix1", this._buffer, 4, false, constants.TYPES.FLOAT);
      this.addAttribute("aMatrix2", this._buffer, 4, false, constants.TYPES.FLOAT);
      this.addAttribute("aMatrix3", this._buffer, 4, false, constants.TYPES.FLOAT);
    }
  }

  var Shader$5 = {"source":"precision highp float;\n\nattribute vec2 aVertexPosition;\n\nattribute vec4 aMatrix0;\nattribute vec4 aMatrix1;\nattribute vec4 aMatrix2;\nattribute vec4 aMatrix3;\n\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform vec4 tint;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void) {\n  mat4 modelMatrix = mat4(aMatrix0, aMatrix1, aMatrix2, aMatrix3);\n\n  gl_Position = modelMatrix * vec4(aVertexPosition.xy, 0.0, 1.0);\n\n  vTextureCoord = vec2(aTextureCoord.x, aTextureCoord.y);\n  vTextureId = aTextureId;\n  vColor = aColor * tint;\n}"};

  var Shader$4 = {"source":"varying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\n    vec4 color;\n    %forloop%\n    gl_FragColor = vColor * vec4(color.rgb, color.a);\n}"};

  const BatchRenderer = CompatibilityAccess.get(PixiCore__namespace, "BatchRenderer") || CompatibilityAccess.get(PixiCore__namespace, "AbstractBatchRenderer");

  class SpriteBatchRenderer extends BatchRenderer {
    constructor(renderer) {
      super(renderer);
      this.shaderGenerator = new PixiCore.BatchShaderGenerator(Shader$5.source, Shader$4.source);
      this.geometryClass = SpriteBatchGeometry;
      this.vertexSize = 6 + 16;
      Object.assign(this.state, {
        culling: false,
        clockwiseFrontFace: false,
        depthTest: true
      });
    }
    packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
      const { uint32View, float32View } = attributeBuffer;
      const packedVertices = aIndex / this.vertexSize;
      const uvs = element.uvs;
      const indicies = element.indices;
      const vertexData = element.vertexData;
      const textureId = element._texture.baseTexture._batchLocation;
      const alpha = Math.min(element.worldAlpha, 1);
      const argb = alpha < 1 && element._texture.baseTexture.alphaMode ? utils.premultiplyTint(element._tintRGB, alpha) : element._tintRGB + (alpha * 255 << 24);
      for (let i = 0; i < vertexData.length; i += 2) {
        float32View[aIndex++] = vertexData[i];
        float32View[aIndex++] = vertexData[i + 1];
        float32View[aIndex++] = uvs[i];
        float32View[aIndex++] = uvs[i + 1];
        uint32View[aIndex++] = argb;
        float32View[aIndex++] = textureId;
        let modelViewProjection = element.modelViewProjection.array;
        for (let j = 0; j < 16; j++) {
          float32View[aIndex++] = modelViewProjection[j];
        }
      }
      for (let i = 0; i < indicies.length; i++) {
        indexBuffer[iIndex++] = packedVertices + indicies[i];
      }
    }
  }
  Compatibility.installRendererPlugin("sprite3d", SpriteBatchRenderer);

  class StandardPipeline extends PixiCore.ObjectRenderer {
    constructor(renderer) {
      super(renderer);
      this.renderer = renderer;
      this._meshes = [];
      this._sprites = [];
      this.materialPass = new MaterialRenderPass(this.renderer, "material");
      this.shadowPass = new ShadowRenderPass(this.renderer, "shadow");
      this.renderPasses = [
        this.shadowPass,
        this.materialPass
      ];
      renderer.on("prerender", () => {
        for (let pass of this.renderPasses) {
          if (pass.clear) {
            pass.clear();
          }
        }
      });
      this._spriteRenderer = new SpriteBatchRenderer(renderer);
    }
    render(object) {
      if (object.isSprite) {
        this._sprites.push(object);
      } else {
        this._meshes.push(object);
      }
    }
    flush() {
      this.sort();
      for (let pass of this.renderPasses) {
        pass.render(this._meshes.filter((mesh) => mesh.isRenderPassEnabled(pass.name)));
      }
      this._meshes = [];
      if (this._sprites.length > 0) {
        this._spriteRenderer.start();
        for (let sprite of this._sprites) {
          this._spriteRenderer.render(sprite);
        }
        this._spriteRenderer.stop();
        this._sprites = [];
      }
    }
    sort() {
      this._meshes.sort((a, b) => {
        if (!a.material || !b.material) {
          return 0;
        }
        if (a.material.renderSortType !== b.material.renderSortType) {
          return a.material.renderSortType === MaterialRenderSortType.transparent ? 1 : -1;
        }
        if (a.renderSortOrder === b.renderSortOrder) {
          return 0;
        }
        return a.renderSortOrder < b.renderSortOrder ? -1 : 1;
      });
      this._sprites.sort((a, b) => {
        if (a.zIndex !== b.zIndex) {
          return a.zIndex - b.zIndex;
        }
        return b.distanceFromCamera - a.distanceFromCamera;
      });
    }
    enableShadows(object, light) {
      let meshes = object instanceof Model ? object.meshes : [object];
      for (let mesh of meshes) {
        if (light && mesh.material instanceof StandardMaterial) {
          mesh.material.shadowCastingLight = light;
        }
        mesh.enableRenderPass(this.shadowPass.name);
      }
      if (light) {
        this.shadowPass.addShadowCastingLight(light);
      }
    }
    disableShadows(object) {
      let meshes = object instanceof Model ? object.meshes : [object];
      for (let mesh of meshes) {
        if (mesh.material instanceof StandardMaterial) {
          mesh.material.shadowCastingLight = void 0;
        }
        mesh.disableRenderPass(this.shadowPass.name);
      }
    }
  }
  Compatibility.installRendererPlugin("pipeline", StandardPipeline);

  const ArrayResource = CompatibilityAccess.get(PixiCore__namespace, "ArrayResource") || CompatibilityAccess.get(PixiCore__namespace, "resources").ArrayResource;

  const BaseImageResource = CompatibilityAccess.get(PixiCore__namespace, "BaseImageResource") || CompatibilityAccess.get(PixiCore__namespace, "resources").BaseImageResource;

  class MipmapResource extends ArrayResource {
    constructor(source, target) {
      super(source);
      this.target = target;
    }
    upload(renderer, baseTexture) {
      renderer.gl.pixelStorei(
        renderer.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
        baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK
      );
      for (let i = 0; i < this.items.length; i++) {
        const resource = this.items[i].resource;
        if (resource instanceof BufferResource) {
          renderer.gl.texImage2D(
            this.target,
            i,
            baseTexture.format,
            resource.width,
            resource.height,
            0,
            baseTexture.format,
            baseTexture.type,
            resource.data
          );
        }
        if (resource instanceof BaseImageResource) {
          renderer.gl.texImage2D(
            this.target,
            i,
            baseTexture.format,
            baseTexture.format,
            baseTexture.type,
            resource.source
          );
        }
      }
      return true;
    }
  }

  const CubeResource = CompatibilityAccess.get(PixiCore__namespace, "CubeResource") || CompatibilityAccess.get(PixiCore__namespace, "resources").CubeResource;

  class CubemapResource extends CubeResource {
    constructor(source, levels = 1) {
      super(source);
      this.levels = levels;
    }
    style(renderer) {
      let gl = renderer.gl;
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (this.levels > 1) {
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else {
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      return true;
    }
  }

  class Cubemap extends PixiCore.BaseTexture {
    constructor() {
      super(...arguments);
      this.cubemapFormat = CubemapFormat.ldr;
    }
    static get faces() {
      return ["posx", "negx", "posy", "negy", "posz", "negz"];
    }
    get levels() {
      return this.resource.levels;
    }
    static fromFaces(faces) {
      const array = Array.isArray(faces) ? faces : [faces];
      const resources = Cubemap.faces.map((face, index) => {
        return new MipmapResource(
          array.map((f) => f[face]),
          constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + index
        );
      });
      return new Cubemap(
        new CubemapResource(resources, array.length)
      );
    }
    static fromColors(posx, negx = posx, posy = posx, negy = posx, posz = posx, negz = posx) {
      const resources = [];
      const colors = [posx, negx, posy, negy, posz, negz];
      for (let i = 0; i < colors.length; i++) {
        let resource = new BufferResource(
          new Uint8Array(colors[i].rgba.map((c) => c * 255)),
          { width: 1, height: 1 }
        );
        let texture = new PixiCore.Texture(new PixiCore.BaseTexture(resource, {
          type: constants.TYPES.UNSIGNED_BYTE,
          format: constants.FORMATS.RGB,
          alphaMode: constants.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
        }));
        resources.push(new MipmapResource(
          [texture],
          constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i
        ));
      }
      return new Cubemap(
        new CubemapResource(resources, 1)
      );
    }
  }

  class CubemapFileVersion1 {
    constructor(json) {
      this.json = json;
    }
    get format() {
      return CubemapFormat.ldr;
    }
    get mipmaps() {
      return this.json;
    }
  }
  class CubemapFileVersion2 {
    constructor(json) {
      this.json = json;
    }
    get format() {
      return this.json.format;
    }
    get mipmaps() {
      return this.json.mipmaps;
    }
  }
  var CubemapFileVersionSelector;
  ((CubemapFileVersionSelector2) => {
    function getFileVersion(json) {
      if (json.version === 2) {
        return new CubemapFileVersion2(json);
      }
      return new CubemapFileVersion1(json);
    }
    CubemapFileVersionSelector2.getFileVersion = getFileVersion;
  })(CubemapFileVersionSelector || (CubemapFileVersionSelector = {}));
  const CubemapLoader = {
    use: function(resource, next) {
      if (resource.extension !== "cubemap") {
        return next();
      }
      const loader = this;
      const version = CubemapFileVersionSelector.getFileVersion(resource.data);
      const mipmaps = version.mipmaps.map((mipmap) => {
        return Cubemap.faces.map((face) => {
          return resource.url.substring(0, resource.url.lastIndexOf("/") + 1) + mipmap.replace("{{face}}", face);
        });
      });
      let urls = mipmaps.reduce((acc, val) => acc.concat(val), []);
      loader.add(urls.filter((url) => !loader.resources[url]).map((url) => {
        return { parentResource: resource, url };
      }));
      let completed = 0;
      let binding = loader.onLoad.add((loader2, res) => {
        if (urls.includes(res.url)) {
          if (++completed === urls.length) {
            const textures = mipmaps.map((face) => {
              return {
                posx: PixiCore.Texture.from(face[0]),
                negx: PixiCore.Texture.from(face[1]),
                posy: PixiCore.Texture.from(face[2]),
                negy: PixiCore.Texture.from(face[3]),
                posz: PixiCore.Texture.from(face[4]),
                negz: PixiCore.Texture.from(face[5])
              };
            });
            let cubemap = Cubemap.fromFaces(textures);
            cubemap.cubemapFormat = version.format;
            resource.cubemap = cubemap;
            binding.detach();
            next();
          }
        }
      });
    },
    add: function() {
      Compatibility.setLoaderResourceExtensionType(
        "cubemap",
        LoaderResourceResponseType.json
      );
    },
    test(url) {
      return url.includes(".cubemap");
    },
    async load(url) {
      if (!Compatibility.assets) {
        throw new Error("PIXI3D: This feature is only available when using PixiJS v7+");
      }
      const response = await settings.settings.ADAPTER.fetch(url);
      const json = await response.json();
      const version = CubemapFileVersionSelector.getFileVersion(json);
      const mipmaps = version.mipmaps.map((mipmap) => {
        return Cubemap.faces.map((face) => {
          return url.substring(0, url.lastIndexOf("/") + 1) + mipmap.replace("{{face}}", face);
        });
      });
      const textures = [];
      for (let mipmap of mipmaps) {
        let faceMipMaps = {
          posx: await Compatibility.assets.load(mipmap[0]),
          negx: await Compatibility.assets.load(mipmap[1]),
          posy: await Compatibility.assets.load(mipmap[2]),
          negy: await Compatibility.assets.load(mipmap[3]),
          posz: await Compatibility.assets.load(mipmap[4]),
          negz: await Compatibility.assets.load(mipmap[5])
        };
        textures.push(faceMipMaps);
      }
      let cubemap = Cubemap.fromFaces(textures);
      cubemap.cubemapFormat = version.format;
      return cubemap;
    }
  };
  Compatibility.installLoaderPlugin("cubemap", CubemapLoader);

  const EXTENSIONS = ["glsl", "vert", "frag"];
  const ShaderSourceLoader = {
    use: (resource, next) => {
      next();
    },
    add: function() {
      for (let ext of EXTENSIONS) {
        Compatibility.setLoaderResourceExtensionType(
          ext,
          LoaderResourceResponseType.text
        );
      }
    },
    test(url) {
      return url.includes(".glsl") || url.includes(".vert") || url.includes(".frag");
    },
    async load(url) {
      const response = await settings.settings.ADAPTER.fetch(url);
      return await response.text();
    }
  };
  Compatibility.installLoaderPlugin("shader", ShaderSourceLoader);

  var Shader$3 = {"source":"attribute vec3 a_Position;\n\nvarying vec3 v_Position;\n\nuniform mat4 u_ModelMatrix;\nuniform mat4 u_View;\nuniform mat4 u_Projection;\n\nvoid main() {\n  v_Position = a_Position.xyz;\n\n  // Converting the view to 3x3 matrix and then back to 4x4 matrix \n  // removes the translation. We do this because we want the skybox to \n  // be centered around the camera.\n  gl_Position = u_Projection * mat4(mat3(u_View)) * u_ModelMatrix * vec4(a_Position, 1.0);\n}"};

  var Shader$2 = {"source":"varying vec3 v_Position;\n\nuniform samplerCube u_EnvironmentSampler;\nuniform bool u_RGBE;\nuniform float u_Exposure;\n\nconst float GAMMA = 2.2;\nconst float INV_GAMMA = 1.0 / GAMMA;\n\n// linear to sRGB approximation\n// see http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html\nvec3 linearToSRGB(vec3 color)\n{\n    return pow(color, vec3(INV_GAMMA));\n}\n\nvec3 decodeRGBE(vec4 rgbe) {\n  vec3 vDecoded;\n  float fExp = rgbe.a * 255.0 - 128.0;\n  vDecoded = rgbe.rgb * exp2(fExp);\n  return vDecoded;\n}\n\nvoid main() {\n  vec4 color = textureCube(u_EnvironmentSampler, v_Position);\n  gl_FragColor = vec4(color.rgb * u_Exposure, 1.0);\n  if (u_RGBE) {\n    color = vec4(decodeRGBE(color), 1.0);\n    gl_FragColor = vec4(linearToSRGB(color.rgb * u_Exposure), 1.0);\n  }\n}"};

  class SkyboxMaterial extends Material {
    constructor(cubemap) {
      super();
      this.exposure = 1;
      this._cubemap = cubemap;
      this.state = Object.assign(new PixiCore.State(), {
        culling: true,
        clockwiseFrontFace: true,
        depthTest: true,
        depthMask: false
      });
    }
    get cubemap() {
      return this._cubemap;
    }
    set cubemap(value) {
      if (value !== this._cubemap) {
        if (!this._cubemap.valid) {
          this._shader = void 0;
        }
        this._cubemap = value;
      }
    }
    updateUniforms(mesh, shader) {
      let camera = this.camera || Camera.main;
      shader.uniforms.u_ModelMatrix = mesh.worldTransform.array;
      shader.uniforms.u_View = camera.view.array;
      shader.uniforms.u_Projection = camera.projection.array;
      shader.uniforms.u_EnvironmentSampler = this.cubemap;
      shader.uniforms.u_RGBE = this.cubemap.cubemapFormat === CubemapFormat.rgbe8;
      shader.uniforms.u_Exposure = this.exposure;
    }
    render(mesh, renderer) {
      renderer.gl.depthMask(false);
      super.render(mesh, renderer);
      renderer.gl.depthMask(true);
    }
    createShader() {
      if (this.cubemap.valid) {
        return new MeshShader(PixiCore.Program.from(Shader$3.source, Shader$2.source));
      }
    }
  }

  class Skybox extends Container3D {
    constructor(cubemap) {
      super();
      this._mesh = this.addChild(Mesh3D.createCube(new SkyboxMaterial(cubemap)));
      this._mesh.renderSortOrder = -1;
    }
    get camera() {
      return this._mesh.material.camera;
    }
    set camera(value) {
      this._mesh.material.camera = value;
    }
    get exposure() {
      return this._mesh.material.exposure;
    }
    set exposure(value) {
      this._mesh.material.exposure = value;
    }
    get cubemap() {
      return this._mesh.material.cubemap;
    }
    set cubemap(value) {
      this._mesh.material.cubemap = value;
    }
    static from(source) {
      return new Skybox(Cubemap.fromFaces(source));
    }
  }

  var Shader$1 = {"source":"#version 100\n\nattribute vec3 a_Position;\n\nuniform mat4 u_ModelViewProjection;\n\nvoid main() {\n  gl_Position = u_ModelViewProjection * vec4(a_Position, 1.0);\n}"};

  var Shader = {"source":"#version 100\n\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n\nuniform vec3 u_Id;\n\nvoid main() {\n  gl_FragColor = vec4(u_Id / 255.0, 1.0);\n}"};

  class PickingMap {
    constructor(_renderer, size) {
      this._renderer = _renderer;
      this._update = 0;
      this._matrix = new Float32Array(16);
      this._pixels = new Uint8Array(size * size * 4);
      this._output = PixiCore.RenderTexture.create({ width: size, height: size, resolution: 1 });
      this._shader = new MeshShader(PixiCore.Program.from(Shader$1.source, Shader.source));
      this._output.framebuffer.addDepthTexture();
    }
    destroy() {
      this._output.destroy(true);
      this._shader.destroy();
    }
    resizeToAspect() {
      const aspect = this._renderer.width / this._renderer.height;
      const aspectWidth = Math.floor(this._output.height * aspect);
      if (this._output.width !== aspectWidth) {
        this._pixels = new Uint8Array(aspectWidth * this._output.height * 4);
        this._output.resize(aspectWidth, this._output.height);
      }
    }
    containsId(x, y, id) {
      const { width, height } = this._renderer.screen;
      x = Math.floor(x / width * this._output.width);
      y = Math.floor((height - y) / height * this._output.height);
      for (let i = 0; i < 3; i++) {
        if (id[i] !== this._pixels[(y * this._output.width + x) * 4 + i]) {
          return false;
        }
      }
      return true;
    }
    update(hitAreas) {
      this._renderer.renderTexture.bind(this._output);
      if (this._update++ % 2 === 0) {
        this._renderer.renderTexture.clear();
        for (let hitArea of hitAreas) {
          this.renderHitArea(hitArea);
        }
      } else {
        const gl = this._renderer.gl;
        gl.readPixels(0, 0, this._output.width, this._output.height, gl.RGBA, gl.UNSIGNED_BYTE, this._pixels);
      }
      this._renderer.renderTexture.bind(void 0);
    }
    renderHitArea(hitArea) {
      const uniforms = this._shader.uniforms;
      const meshes = hitArea.object instanceof Mesh3D ? [hitArea.object] : hitArea.object.meshes;
      const camera = hitArea.camera || Camera.main;
      for (let mesh of meshes) {
        uniforms.u_Id = hitArea.id;
        uniforms.u_ModelViewProjection = Mat4.multiply(
          camera.viewProjection.array,
          mesh.transform.worldTransform.array,
          this._matrix
        );
        this._shader.render(mesh, this._renderer);
      }
    }
  }

  class PickingInteraction {
    constructor(renderer) {
      this.renderer = renderer;
      this._hitAreas = [];
      this._map = new PickingMap(this.renderer, 128);
      ticker.Ticker.shared.add(this._update, this, ticker.UPDATE_PRIORITY.LOW);
      if (!PickingInteraction.main) {
        PickingInteraction.main = this;
      }
    }
    _update() {
      if (!this.renderer.plugins) {
        return;
      }
      let interaction = Compatibility.getInteractionPlugin(this.renderer);
      if (interaction) {
        interaction.hitTest(new math.Point(0, 0));
      }
      if (this._hitAreas.length > 0) {
        this._map.resizeToAspect();
        this._map.update(this._hitAreas);
        this._hitAreas = [];
      }
    }
    destroy() {
      if (this === PickingInteraction.main) {
        PickingInteraction.main = void 0;
      }
      ticker.Ticker.shared.remove(this._update, this);
    }
    containsHitArea(x, y, hitArea) {
      if (this._hitAreas.indexOf(hitArea) < 0) {
        this._hitAreas.push(hitArea);
      }
      return this._map.containsId(x, y, hitArea.id);
    }
  }
  Compatibility.installRendererPlugin("picking", PickingInteraction);

  var PickingId;
  ((PickingId2) => {
    let id = 0;
    function next() {
      id++;
      return new Uint8Array([
        id >> 16 & 255,
        id >> 8 & 255,
        id & 255
      ]);
    }
    PickingId2.next = next;
  })(PickingId || (PickingId = {}));

  class PickingHitArea {
    constructor(object, camera) {
      this.object = object;
      this.camera = camera;
      this.id = PickingId.next();
    }
    contains(x, y) {
      return PickingInteraction.main.containsHitArea(x, y, this);
    }
  }

  var ShadowQuality = /* @__PURE__ */ ((ShadowQuality2) => {
    ShadowQuality2["low"] = "low";
    ShadowQuality2["medium"] = "medium";
    ShadowQuality2["high"] = "high";
    return ShadowQuality2;
  })(ShadowQuality || {});

  var ShadowTexture;
  ((ShadowTexture2) => {
    function create(renderer, size, quality) {
      let type = getSupportedType(renderer, quality);
      return PixiCore.RenderTexture.create({
        width: size,
        height: size,
        type,
        scaleMode: getSupportedScaleMode(renderer)
      });
    }
    ShadowTexture2.create = create;
    function getSupportedScaleMode(renderer) {
      if (Capabilities.supportsFloatLinear(renderer)) {
        return constants.SCALE_MODES.LINEAR;
      }
      return constants.SCALE_MODES.NEAREST;
    }
    function getSupportedType(renderer, quality) {
      if (quality === ShadowQuality.high) {
        if (Capabilities.isFloatFramebufferSupported(renderer)) {
          return constants.TYPES.FLOAT;
        }
        if (Capabilities.isHalfFloatFramebufferSupported(renderer)) {
          return constants.TYPES.HALF_FLOAT;
        }
      }
      if (quality === ShadowQuality.medium && Capabilities.isHalfFloatFramebufferSupported(renderer)) {
        return constants.TYPES.HALF_FLOAT;
      }
      return constants.TYPES.UNSIGNED_BYTE;
    }
  })(ShadowTexture || (ShadowTexture = {}));

  var ShadowMath;
  ((ShadowMath2) => {
    const _lightProjection = new Float32Array(16);
    const _lightView = new Float32Array(16);
    const _conjugateRotation = new Float32Array(4);
    const _lightSpacePosition = new Float32Array(3);
    const _lightSpaceForward = new Float32Array(3);
    const _cameraTarget = new Float32Array(3);
    const _cameraForward = new Float32Array(3);
    function calculateDirectionalLightViewProjection(shadowCastingLight) {
      if (shadowCastingLight.light.type !== LightType.directional) {
        return;
      }
      let halfShadowArea = shadowCastingLight.shadowArea / 2;
      let worldTexelSize = halfShadowArea * 2 / shadowCastingLight.shadowArea;
      let lightProjection = Mat4.ortho(
        -halfShadowArea,
        halfShadowArea,
        -halfShadowArea,
        halfShadowArea,
        -halfShadowArea,
        halfShadowArea,
        _lightProjection
      );
      let light = shadowCastingLight.light;
      let camera = shadowCastingLight.camera || Camera.main;
      if (camera && shadowCastingLight.followCamera) {
        Vec3.scale(camera.worldTransform.forward.array, halfShadowArea, _cameraForward);
        Vec3.add(camera.worldTransform.position.array, _cameraForward, _cameraTarget);
        Vec3.transformQuat(_cameraTarget, Quat.conjugate(
          shadowCastingLight.light.worldTransform.rotation.array,
          _conjugateRotation
        ), _lightSpacePosition);
        _lightSpacePosition[0] = worldTexelSize * Math.floor(_lightSpacePosition[0] / worldTexelSize);
        _lightSpacePosition[1] = worldTexelSize * Math.floor(_lightSpacePosition[1] / worldTexelSize);
        Vec3.transformQuat(_lightSpacePosition, light.worldTransform.rotation.array, _lightSpacePosition);
        Vec3.add(_lightSpacePosition, light.worldTransform.forward.array, _lightSpaceForward);
        Mat4.lookAt(_lightSpacePosition, _lightSpaceForward, light.worldTransform.up.array, _lightView);
        Mat4.multiply(lightProjection, _lightView, shadowCastingLight.lightViewProjection);
      } else {
        Vec3.add(
          light.worldTransform.position.array,
          shadowCastingLight.light.worldTransform.forward.array,
          _cameraTarget
        );
        Mat4.lookAt(
          light.worldTransform.position.array,
          _cameraTarget,
          light.worldTransform.up.array,
          _lightView
        );
        Mat4.multiply(lightProjection, _lightView, shadowCastingLight.lightViewProjection);
      }
    }
    ShadowMath2.calculateDirectionalLightViewProjection = calculateDirectionalLightViewProjection;
    function calculateSpotLightViewProjection(shadowCastingLight) {
      if (shadowCastingLight.light.type !== LightType.spot) {
        return;
      }
      let light = shadowCastingLight.light;
      Mat4.perspective(light.outerConeAngle * math.DEG_TO_RAD * 2, 1, 2, light.range, _lightProjection);
      Vec3.add(light.worldTransform.position.array, light.worldTransform.forward.array, _cameraTarget);
      Mat4.lookAt(light.worldTransform.position.array, _cameraTarget, light.worldTransform.up.array, _lightView);
      Mat4.multiply(_lightProjection, _lightView, shadowCastingLight.lightViewProjection);
    }
    ShadowMath2.calculateSpotLightViewProjection = calculateSpotLightViewProjection;
  })(ShadowMath || (ShadowMath = {}));

  class ShadowCastingLight {
    constructor(renderer, light, options) {
      this.renderer = renderer;
      this.light = light;
      this._lightViewProjection = new Float32Array(16);
      this.softness = 0;
      this.shadowArea = 50;
      this.followCamera = true;
      if (light.type === LightType.point) {
        throw new Error("PIXI3D: Only directional and spot lights are supported as shadow casters.");
      }
      const { shadowTextureSize = 1024, quality = ShadowQuality.medium } = options || {};
      this._shadowTexture = ShadowTexture.create(renderer, shadowTextureSize, quality);
      this._shadowTexture.baseTexture.framebuffer.addDepthTexture();
      this._filterTexture = ShadowTexture.create(renderer, shadowTextureSize, quality);
    }
    get lightViewProjection() {
      return this._lightViewProjection;
    }
    get shadowTexture() {
      return this._shadowTexture;
    }
    get filterTexture() {
      return this._filterTexture;
    }
    destroy() {
      this._shadowTexture.destroy(true);
      this._filterTexture.destroy(true);
    }
    clear() {
      this.renderer.renderTexture.bind(this._shadowTexture);
      this.renderer.renderTexture.clear([0, 0, 0, 0], this.renderer.gl.COLOR_BUFFER_BIT | this.renderer.gl.DEPTH_BUFFER_BIT);
      this.renderer.renderTexture.bind(void 0);
    }
    updateLightViewProjection() {
      if (this.light.type === LightType.directional) {
        ShadowMath.calculateDirectionalLightViewProjection(this);
      } else if (this.light.type === LightType.spot) {
        ShadowMath.calculateSpotLightViewProjection(this);
      }
    }
    static isMediumQualitySupported(renderer) {
      return Capabilities.isHalfFloatFramebufferSupported(renderer);
    }
    static isHighQualitySupported(renderer) {
      return Capabilities.isFloatFramebufferSupported(renderer);
    }
  }

  class CompositeSprite extends sprite.Sprite {
    constructor(renderer, options) {
      super();
      this.renderer = renderer;
      this._tickerRender = () => {
      };
      let {
        width = 512,
        height = 512,
        objectToRender,
        resolution = 1
      } = options || {};
      this._renderTexture = PixiCore.RenderTexture.create({ width, height, resolution });
      this._renderTexture.rotate = 8;
      this._renderTexture.baseTexture.framebuffer.depth = true;
      this._texture = this._renderTexture;
      if (!options || !options.width || !options.height) {
        renderer.on("prerender", () => {
          this._renderTexture.resize(renderer.screen.width, renderer.screen.height);
        });
      }
      if (objectToRender) {
        this._tickerRender = () => {
          if (Compatibility.isRendererDestroyed(renderer)) {
            ticker.Ticker.shared.remove(this._tickerRender);
            return;
          }
          if (this.worldVisible && this.worldAlpha > 0 && this.renderable) {
            objectToRender && this.renderObject(objectToRender);
          }
        };
        ticker.Ticker.shared.add(this._tickerRender);
      }
    }
    get renderTexture() {
      return this._renderTexture;
    }
    setResolution(resolution) {
      this._renderTexture.setResolution(resolution);
      this._renderTexture.resize(
        this._renderTexture.width,
        this._renderTexture.height,
        true
      );
    }
    destroy(options) {
      ticker.Ticker.shared.remove(this._tickerRender);
      super.destroy(options);
    }
    renderObject(object) {
      Compatibility.render(this.renderer, object, this.renderTexture);
    }
  }

  function approximately(a, b) {
    return Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
  }
  const EPSILON = 1e-6;
  class Plane {
    constructor(normal, distance) {
      this.distance = distance;
      this._normal = new Point3D();
      this._normal = normal.normalize(this._normal);
    }
    static from(position, normal) {
      return new Plane(normal, Point3D.dot(position, normal));
    }
    get normal() {
      return this._normal;
    }
    rayCast(ray) {
      const vdot = Point3D.dot(ray.direction, this.normal);
      if (approximately(vdot, 0)) {
        return 0;
      }
      const ndot = -Point3D.dot(ray.origin, this.normal) - this.distance;
      return ndot / vdot;
    }
  }

  var SpriteBillboardType = /* @__PURE__ */ ((SpriteBillboardType2) => {
    SpriteBillboardType2["spherical"] = "spherical";
    SpriteBillboardType2["cylindrical"] = "cylindrical";
    return SpriteBillboardType2;
  })(SpriteBillboardType || {});

  class ProjectionSprite extends sprite.Sprite {
    constructor(texture) {
      super(texture);
      this._pixelsPerUnit = 100;
      this.distanceFromCamera = 0;
      this.modelViewProjection = new Matrix4x4();
      this.pluginName = "pipeline";
    }
    get pixelsPerUnit() {
      return this._pixelsPerUnit;
    }
    set pixelsPerUnit(value) {
      if (value !== this._pixelsPerUnit) {
        this._transformID = -1;
        this._pixelsPerUnit = value;
      }
    }
    calculateVertices() {
      const texture = this._texture;
      if (this._transformID === this.transform._worldID && this._textureID === texture._updateID) {
        return;
      }
      if (this._textureID !== texture._updateID) {
        this.uvs = this._texture._uvs.uvsFloat32;
      }
      this._transformID = this.transform._worldID;
      this._textureID = texture._updateID;
      const wt = this.transform.worldTransform;
      const orig = texture.orig;
      const anchor = this._anchor;
      const w1 = texture.trim ? texture.trim.x - anchor._x * orig.width : -anchor._x * orig.width;
      const w0 = texture.trim ? w1 + texture.trim.width : w1 + orig.width;
      const h1 = texture.trim ? texture.trim.y - anchor._y * orig.height : -anchor._y * orig.height;
      const h0 = texture.trim ? h1 + texture.trim.height : h1 + orig.height;
      this.vertexData[0] = (wt.a * w1 + wt.c * -h1) / this._pixelsPerUnit;
      this.vertexData[1] = (wt.d * -h1 + wt.b * w1) / this._pixelsPerUnit;
      this.vertexData[2] = (wt.a * w0 + wt.c * -h1) / this._pixelsPerUnit;
      this.vertexData[3] = (wt.d * -h1 + wt.b * w0) / this._pixelsPerUnit;
      this.vertexData[4] = (wt.a * w0 + wt.c * -h0) / this._pixelsPerUnit;
      this.vertexData[5] = (wt.d * -h0 + wt.b * w0) / this._pixelsPerUnit;
      this.vertexData[6] = (wt.a * w1 + wt.c * -h0) / this._pixelsPerUnit;
      this.vertexData[7] = (wt.d * -h0 + wt.b * w1) / this._pixelsPerUnit;
      if (this.roundPixels) {
        const resolution = settings.settings.RESOLUTION;
        for (var i = 0; i < this.vertexData.length; ++i) {
          this.vertexData[i] = Math.round((this.vertexData[i] * resolution | 0) / resolution);
        }
      }
    }
  }

  const vec3 = new Float32Array(3);
  class Sprite3D extends Container3D {
    constructor(texture) {
      super();
      this._modelView = new Float32Array(16);
      this._sprite = new ProjectionSprite(texture);
      this._sprite.anchor.set(0.5);
    }
    get billboardType() {
      return this._billboardType;
    }
    set billboardType(value) {
      if (value !== this._billboardType) {
        this._billboardType = value;
        this._cameraTransformId = void 0;
      }
    }
    get pixelsPerUnit() {
      return this._sprite.pixelsPerUnit;
    }
    set pixelsPerUnit(value) {
      this._sprite.pixelsPerUnit = value;
    }
    get renderSortOrder() {
      return this._sprite.zIndex;
    }
    set renderSortOrder(value) {
      this._sprite.zIndex = value;
    }
    get tint() {
      return this._sprite.tint;
    }
    set tint(value) {
      this._sprite.tint = value;
    }
    destroy(options) {
      super.destroy(options);
      this._sprite.destroy(options);
    }
    _render(renderer) {
      const camera = this.camera || Camera.main;
      const update = camera.transformId !== this._cameraTransformId || this._parentID !== this.transform._worldID;
      if (update) {
        const scaling = this.worldTransform.scaling;
        Mat4.multiply(camera.view.array, this.worldTransform.array, this._modelView);
        switch (this._billboardType) {
          case SpriteBillboardType.spherical: {
            this._modelView[0] = scaling.x;
            this._modelView[1] = 0;
            this._modelView[2] = 0;
            this._modelView[3] = 0;
            this._modelView[4] = 0;
            this._modelView[5] = scaling.y;
            this._modelView[6] = 0;
            this._modelView[7] = 0;
            break;
          }
          case SpriteBillboardType.cylindrical: {
            this._modelView[0] = scaling.x;
            this._modelView[1] = 0;
            this._modelView[2] = 0;
            this._modelView[3] = 0;
            this._modelView[8] = 0;
            this._modelView[9] = 0;
            this._modelView[10] = 1;
            this._modelView[11] = 0;
            break;
          }
        }
        Mat4.multiply(
          camera.projection.array,
          this._modelView,
          this._sprite.modelViewProjection.array
        );
        this._parentID = this.transform._worldID;
        this._cameraTransformId = camera.transformId;
        const dir = Vec3.subtract(
          camera.worldTransform.position.array,
          this.worldTransform.position.array,
          vec3
        );
        const projection = Vec3.scale(
          camera.worldTransform.forward.array,
          Vec3.dot(dir, camera.worldTransform.forward.array),
          vec3
        );
        this._sprite.distanceFromCamera = Vec3.squaredMagnitude(projection);
      }
      this._sprite.worldAlpha = this.worldAlpha;
      this._sprite.render(renderer);
    }
    get anchor() {
      return this._sprite.anchor;
    }
    set anchor(value) {
      this._sprite.anchor = value;
    }
    get texture() {
      return this._sprite.texture;
    }
    set texture(value) {
      this._sprite.texture = value;
    }
    get blendMode() {
      return this._sprite.blendMode;
    }
    set blendMode(value) {
      this._sprite.blendMode = value;
    }
  }

  exports.AABB = AABB;
  exports.Animation = Animation;
  exports.Camera = Camera;
  exports.CameraOrbitControl = CameraOrbitControl;
  exports.Color = Color;
  exports.CompositeSprite = CompositeSprite;
  exports.Container3D = Container3D;
  exports.Cubemap = Cubemap;
  exports.CubemapFormat = CubemapFormat;
  exports.CubemapLoader = CubemapLoader;
  exports.CubemapResource = CubemapResource;
  exports.Fog = Fog;
  exports.ImageBasedLighting = ImageBasedLighting;
  exports.InstancedModel = InstancedModel;
  exports.InstancedStandardMaterial = InstancedStandardMaterial;
  exports.Joint = Joint;
  exports.Light = Light;
  exports.LightType = LightType;
  exports.LightingEnvironment = LightingEnvironment;
  exports.Mat4 = Mat4;
  exports.Material = Material;
  exports.MaterialRenderPass = MaterialRenderPass;
  exports.MaterialRenderSortType = MaterialRenderSortType;
  exports.Matrix4x4 = Matrix4x4;
  exports.Mesh3D = Mesh3D;
  exports.MeshGeometry3D = MeshGeometry3D;
  exports.MeshShader = MeshShader;
  exports.Model = Model;
  exports.PickingHitArea = PickingHitArea;
  exports.PickingInteraction = PickingInteraction;
  exports.Plane = Plane;
  exports.Point3D = Point3D;
  exports.Quat = Quat;
  exports.Quaternion = Quaternion;
  exports.Ray = Ray;
  exports.ShaderSourceLoader = ShaderSourceLoader;
  exports.ShadowCastingLight = ShadowCastingLight;
  exports.ShadowQuality = ShadowQuality;
  exports.ShadowRenderPass = ShadowRenderPass;
  exports.Skin = Skin;
  exports.Skybox = Skybox;
  exports.Sprite3D = Sprite3D;
  exports.SpriteBatchRenderer = SpriteBatchRenderer;
  exports.SpriteBillboardType = SpriteBillboardType;
  exports.StandardMaterial = StandardMaterial;
  exports.StandardMaterialAlphaMode = StandardMaterialAlphaMode;
  exports.StandardMaterialDebugMode = StandardMaterialDebugMode;
  exports.StandardMaterialNormalTexture = StandardMaterialNormalTexture;
  exports.StandardMaterialOcclusionTexture = StandardMaterialOcclusionTexture;
  exports.StandardMaterialTexture = StandardMaterialTexture;
  exports.StandardPipeline = StandardPipeline;
  exports.TextureTransform = TextureTransform;
  exports.Transform3D = Transform3D;
  exports.Vec3 = Vec3;
  exports.glTFAsset = glTFAsset;
  exports.glTFBinaryLoader = glTFBinaryLoader;
  exports.glTFLoader = glTFLoader;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, PIXI, PIXI, PIXI, PIXI, PIXI, PIXI, PIXI, PIXI.utils, PIXI, PIXI);
//# sourceMappingURL=pixi3d.js.map
