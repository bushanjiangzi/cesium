define([
    '../Core/PixelFormat',
    '../Shaders/CheckFloatTexturePrecisionFS',
    './ComputeCommand',
    './ComputeEngine',
    './Framebuffer',
    './PixelDatatype',
    './Texture'
], function(
    PixelFormat,
    CheckFloatTexturePrecisionFS,
    ComputeCommand,
    ComputeEngine,
    Framebuffer,
    PixelDatatype,
    Texture
) {
    'use strict';

    /**
     * Checks if the context's floating point textures support 6 decimal places of precision.
     *
     * @param {Context} context A context wrapping a gl implementation.
     * @returns {Boolean} whether or not the context's floating point textures support 6 decimal places of precision
     *
     * @private
     */
    function checkFloatTexturePrecision(context) {
        if (!context.floatingPointTexture) {
            return false;
        }

        var computeEngine = new ComputeEngine(context);
        var outputTexture = new Texture({
            context : context,
            width : 1,
            height : 1,
            pixelFormat : PixelFormat.RGBA
        });

        var floatTexture = new Texture({
            context : context,
            width : 1,
            height : 1,
            pixelFormat : PixelFormat.RGBA,
            pixelDatatype : checkFloatTexturePrecision._getFloatPixelType(),
            source : {
                width : 1,
                height : 1,
                arrayBufferView : checkFloatTexturePrecision._getArray([123456, 0, 0, 0])
            }
        });

        var framebuffer = new Framebuffer({
            context : context,
            colorTextures : [outputTexture],
            destroyAttachments : false
        });

        var readState = {
            framebuffer : framebuffer,
            x : 0,
            y : 0,
            width : 1,
            height : 1
        };

        var sixPlaces = false;
        var computeCommand = new ComputeCommand({
            fragmentShaderSource : CheckFloatTexturePrecisionFS,
            outputTexture : outputTexture,
            uniformMap : {
                u_floatTexture : function() {
                    return floatTexture;
                }
            },
            persists : false,
            postExecute : function() {
                var pixel = context.readPixels(readState);
                sixPlaces = pixel[0] === 0;
            }
        });

        computeCommand.execute(computeEngine);

        computeEngine.destroy();
        framebuffer.destroy();

        return sixPlaces;
    }

    checkFloatTexturePrecision._getFloatPixelType = function() {
        return PixelDatatype.FLOAT;
    };

    checkFloatTexturePrecision._getArray = function(array) {
        return new Float32Array(array);
    };

    return checkFloatTexturePrecision;
});
