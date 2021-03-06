function(
        DeveloperError,
        ComponentDatatype,
        BufferUsage,
        IndexDatatype) {
    "use strict";

    /**
     * Provides terrain or other geometry for the surface of an ellipsoid.  The surface geometry is
     * organized into a pyramid of tiles according to a {@link TilingScheme}.  This type describes an
     * interface and is not intended to be instantiated directly.
     *
     * @alias TerrainProvider
     * @constructor
     *
     * @see EllipsoidTerrainProvider
     */
    function TerrainProvider() {
        /**
         * The tiling scheme used to tile the surface.
         *
         * @type TilingScheme
         */
        this.tilingScheme = undefined;

        throw new DeveloperError('This type should not be instantiated directly.');
    }

    /**
     * Specifies the indices of the attributes of the terrain geometry.
     *
     * @memberof TerrainProvider
     */
    TerrainProvider.attributeIndices = {
        position3D : 0,
        textureCoordinates : 1,
        position2D : 2
    };

    var regularGridIndexArrays = [];

    TerrainProvider.getRegularGridIndices = function(width, height) {
        var byWidth = regularGridIndexArrays[width];
        if (typeof byWidth === 'undefined') {
            regularGridIndexArrays[width] = byWidth = [];
        }

        var indices = byWidth[height];
        if (typeof indices === 'undefined') {
            indices = byWidth[height] = new Uint16Array((width - 1) * (height - 1) * 6);

            var index = 0;
            var indicesIndex = 0;
            for ( var i = 0; i < height - 1; ++i) {
                for ( var j = 0; j < width - 1; ++j) {
                    var upperLeft = index;
                    var lowerLeft = upperLeft + width;
                    var lowerRight = lowerLeft + 1;
                    var upperRight = upperLeft + 1;

                    indices[indicesIndex++] = upperLeft;
                    indices[indicesIndex++] = lowerLeft;
                    indices[indicesIndex++] = upperRight;
                    indices[indicesIndex++] = upperRight;
                    indices[indicesIndex++] = lowerLeft;
                    indices[indicesIndex++] = lowerRight;

                    ++index;
                }
                ++index;
            }
        }

        return indices;
    };

    TerrainProvider.createTileEllipsoidGeometryFromBuffers = function(context, tile, buffers) {
        var datatype = ComponentDatatype.FLOAT;
        var typedArray = buffers.vertices;
        var buffer = context.createVertexBuffer(typedArray, BufferUsage.STATIC_DRAW);
        var stride = 5 * datatype.sizeInBytes;
        var attributes = [{
            index : TerrainProvider.attributeIndices.position3D,
            vertexBuffer : buffer,
            componentDatatype : datatype,
            componentsPerAttribute : 3,
            offsetInBytes : 0,
            strideInBytes : stride
        }, {
            index : TerrainProvider.attributeIndices.textureCoordinates,
            vertexBuffer : buffer,
            componentDatatype : datatype,
            componentsPerAttribute : 2,
            offsetInBytes : 3 * datatype.sizeInBytes,
            strideInBytes : stride
        }, {
            index : TerrainProvider.attributeIndices.position2D,
            value : [0.0, 0.0]
        }];
        var indexBuffer = buffers.indices.indexBuffer;
        if (typeof indexBuffer === 'undefined' || indexBuffer.isDestroyed()) {
            indexBuffer = buffers.indices.indexBuffer = context.createIndexBuffer(buffers.indices, BufferUsage.STATIC_DRAW, IndexDatatype.UNSIGNED_SHORT);
            indexBuffer.setVertexArrayDestroyable(false);
            indexBuffer.referenceCount = 1;
        } else {
            ++indexBuffer.referenceCount;
        }

        tile.vertexArray = context.createVertexArray(attributes, indexBuffer);
    };

    TerrainProvider.createTilePlaneGeometryFromBuffers = function(context, tile, buffers) {
        var datatype = ComponentDatatype.FLOAT;
        var usage = BufferUsage.STATIC_DRAW;

        var typedArray = datatype.toTypedArray(buffers.vertices);
        var buffer = context.createVertexBuffer(typedArray, usage);
        var stride = 7 * datatype.sizeInBytes;
        var attributes = [{
            index : TerrainProvider.attributeIndices.position3D,
            vertexBuffer : buffer,
            componentDatatype : datatype,
            componentsPerAttribute : 3,
            offsetInBytes : 0,
            strideInBytes : stride
        }, {
            index : TerrainProvider.attributeIndices.textureCoordinates,
            vertexBuffer : buffer,
            componentDatatype : datatype,
            componentsPerAttribute : 2,
            offsetInBytes : 3 * datatype.sizeInBytes,
            strideInBytes : stride
        }, {
            index : TerrainProvider.attributeIndices.position2D,
            vertexBuffer : buffer,
            componentDatatype : datatype,
            componentsPerAttribute : 2,
            offsetInBytes : 5 * datatype.sizeInBytes,
            strideInBytes : stride
        }];

        var indexBuffer = context.createIndexBuffer(new Uint16Array(buffers.indices), usage, IndexDatatype.UNSIGNED_SHORT);

        tile.vertexArray = context.createVertexArray(attributes, indexBuffer);
    };

    // Is there a limit on 'level' of the tile that can be passed in?  It seems
    // natural to have a maxLevel, but this would cause problems if we have hi-res imagery
    // and low-res terrain.  So I'd say we can continue to refine terrain tiles arbitrarily
    // until both the terrain and all the imagery layers have no more detail to give.  In that
    // case, this method is expected to be able to produce geometry for an arbitrarily-deep
    // tile tree.

    /**
     * Request the tile geometry from the remote server.  Once complete, the
     * tile state should be set to RECEIVED.  Alternatively, tile state can be set to
     * UNLOADED to indicate that the request should be attempted again next update, if the tile
     * is still needed.
     *
     * @param {Tile} The tile to request geometry for.
     */
    TerrainProvider.prototype.requestTileGeometry = function(tile) {
        throw new DeveloperError('This type should not be instantiated directly.');
    };

    /**
     * Transform the tile geometry from the format requested from the remote server
     * into a format suitable for resource creation.  Once complete, the tile
     * state should be set to TRANSFORMED.  Alternatively, tile state can be set to
     * RECEIVED to indicate that the transformation should be attempted again next update, if the tile
     * is still needed.
     *
     * @param {Context} context The context to use to create resources.
     * @param {Tile} tile The tile to transform geometry for.
     */
    TerrainProvider.prototype.transformGeometry = function(context, tile) {
        throw new DeveloperError('This type should not be instantiated directly.');
    };

    /**
     * Create WebGL resources for the tile using whatever data the transformGeometry step produced.
     * Once complete, the tile state should be set to READY.  Alternatively, tile state can be set to
     * TRANSFORMED to indicate that resource creation should be attempted again next update, if the tile
     * is still needed.
     *
     * @param {Context} context The context to use to create resources.
     * @param {Tile} tile The tile to create resources for.
     */
    TerrainProvider.prototype.createResources = function(context, tile) {
        throw new DeveloperError('This type should not be instantiated directly.');
    };

    return TerrainProvider;
}