export class AssetLoader {
    constructor() {
        this.images = {};
        this.audio = {};
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
    }
    
    loadImage(name, path) {
        return new Promise((resolve, reject) => {
            if (window.DEBUG_MODE) console.log(`🖼️ Loading image: ${name} from ${path}`);
            const img = new Image();
            img.onload = () => {
                // Optionally trim transparent padding for specific sprites to avoid overlay misalignment
                try {
                    if (['cup_small', 'cup_medium', 'cup_large'].includes(name)) {
                        this.images[name] = this.trimTransparentPadding(img);
                    } else {
                        this.images[name] = img;
                    }
                } catch (e) {
                    if (window.DEBUG_MODE) console.warn(`Failed to trim image ${name}, using original`, e);
                    this.images[name] = img;
                }
                
                this.loadedAssets++;
                if (window.DEBUG_MODE) console.log(`✅ Image loaded: ${name} (${img.width}x${img.height})`);
                if (this.onProgress) this.onProgress(this.loadedAssets, this.totalAssets);
                resolve(this.images[name]);
            };
            img.onerror = () => {
                // Create placeholder for missing images
                if (window.DEBUG_MODE) console.warn(`❌ Image file not found: ${path} - using placeholder`);
                this.images[name] = null; // Will use fallback rendering
                this.loadedAssets++;
                if (this.onProgress) this.onProgress(this.loadedAssets, this.totalAssets);
                resolve(null);
            };
            img.src = path;
        });
    }

    // Create a tightly-cropped copy of an image by removing fully transparent borders
    trimTransparentPadding(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const { width, height } = canvas;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let top = height, left = width, right = -1, bottom = -1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] !== 0) { // non-transparent
                    if (x < left) left = x;
                    if (x > right) right = x;
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                }
            }
        }

        // Entirely transparent or already tight
        if (right < left || bottom < top) return img;
        const cropW = right - left + 1;
        const cropH = bottom - top + 1;

        const out = document.createElement('canvas');
        out.width = cropW;
        out.height = cropH;
        const octx = out.getContext('2d');
        octx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);

        const trimmed = new Image();
        trimmed.src = out.toDataURL('image/png');
        return trimmed;
    }

    removeImageBackground(img, imageName) {
        try {
            if (window.DEBUG_MODE) console.log(`🎨 Processing enhanced background removal for ${imageName}`);
            
            // Create canvas to process the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the original image
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Sample background color from multiple edge points (not just corners)
            const edgePoints = [];
            const edgeSize = 20; // Sample from larger edge area
            
            // Top and bottom edges
            for (let x = 0; x < canvas.width; x += 10) {
                edgePoints.push({ x, y: 5 });
                edgePoints.push({ x, y: canvas.height - 5 });
            }
            // Left and right edges
            for (let y = 0; y < canvas.height; y += 10) {
                edgePoints.push({ x: 5, y });
                edgePoints.push({ x: canvas.width - 5, y });
            }
            
            let avgR = 0, avgG = 0, avgB = 0;
            edgePoints.forEach(point => {
                if (point.x >= 0 && point.x < canvas.width && point.y >= 0 && point.y < canvas.height) {
                    const pixelIndex = (point.y * canvas.width + point.x) * 4;
                    avgR += data[pixelIndex];
                    avgG += data[pixelIndex + 1];
                    avgB += data[pixelIndex + 2];
                }
            });
            
            // Calculate average background color
            avgR = Math.round(avgR / edgePoints.length);
            avgG = Math.round(avgG / edgePoints.length);
            avgB = Math.round(avgB / edgePoints.length);
            
            let pixelsChanged = 0;
            
            // ENHANCED CLEANING: Multiple passes with different criteria
            
            // Pass 1: Remove obvious background colors
            const tolerance1 = 40; // More aggressive tolerance
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const rDiff = Math.abs(r - avgR);
                const gDiff = Math.abs(g - avgG);
                const bDiff = Math.abs(b - avgB);
                
                if (rDiff <= tolerance1 && gDiff <= tolerance1 && bDiff <= tolerance1) {
                    data[i + 3] = 0; // Make transparent
                    pixelsChanged++;
                }
            }
            
            // Pass 2: Aggressive light color and artifact removal
            const lightThreshold = 180; // Much more aggressive threshold for light colors
            const upperRegionHeight = Math.floor(canvas.height * 0.4); // Top 40% of image
            
            // EXTREME Pass 1.5: Target dark rectangular artifacts specifically
            // Based on user's screenshot, the artifact appears to be a dark horizontal rectangle
            const darkArtifactThreshold = 120; // Target darker colors that form rectangles
            for (let y = 0; y < upperRegionHeight; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const alpha = data[i + 3];
                    
                    // Skip already transparent pixels
                    if (alpha === 0) continue;
                    
                    // Target dark colors that could form rectangular artifacts
                    const isDarkArtifact = (r < darkArtifactThreshold && g < darkArtifactThreshold && b < darkArtifactThreshold);
                    
                    // Also target colors that are very uniform (typical of UI elements)
                    const colorVariation = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
                    const isUniformColor = colorVariation < 30;
                    
                    if (isDarkArtifact && isUniformColor) {
                        data[i + 3] = 0;
                        pixelsChanged++;
                    }
                }
            }
            
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const alpha = data[i + 3];
                    
                    // Skip already transparent pixels
                    if (alpha === 0) continue;
                    
                    const isUpperRegion = y < upperRegionHeight;
                    const currentThreshold = isUpperRegion ? 160 : lightThreshold; // Even more aggressive in upper region
                    
                    // Remove light colored pixels (likely artifacts)
                    if (r >= currentThreshold && g >= currentThreshold && b >= currentThreshold) {
                        data[i + 3] = 0;
                        pixelsChanged++;
                        continue;
                    }
                    
                    // Target specific artifact colors (light blue/gray common in UI elements)
                    const isLightBlue = (r >= 150 && g >= 180 && b >= 220); // Light blue artifacts
                    const isLightGray = (r >= 170 && g >= 170 && b >= 170 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20); // Gray artifacts
                    
                    if (isUpperRegion && (isLightBlue || isLightGray)) {
                        data[i + 3] = 0;
                        pixelsChanged++;
                    }
                }
            }
            
            // Pass 3: Rectangular artifact detection and removal
            // Look for horizontal lines that might form rectangular UI elements
            const rectDetectionRadius = 5;
            const minLineLength = 15;
            
            for (let y = 0; y < upperRegionHeight; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    
                    // Skip already transparent pixels
                    if (data[i + 3] === 0) continue;
                    
                    // Check for horizontal lines (common in rectangular artifacts)
                    let horizontalLength = 0;
                    for (let checkX = x; checkX < Math.min(x + minLineLength, canvas.width); checkX++) {
                        const checkI = (y * canvas.width + checkX) * 4;
                        if (data[checkI + 3] > 0) {
                            const checkR = data[checkI];
                            const checkG = data[checkI + 1];
                            const checkB = data[checkI + 2];
                            
                            // Check if it's a light color that forms a line
                            if (checkR >= 150 && checkG >= 150 && checkB >= 150) {
                                horizontalLength++;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    
                    // If we found a horizontal line of light pixels, remove the entire line
                    if (horizontalLength >= minLineLength) {
                        for (let removeX = x; removeX < x + horizontalLength; removeX++) {
                            const removeI = (y * canvas.width + removeX) * 4;
                            if (data[removeI + 3] > 0) {
                                data[removeI + 3] = 0;
                                pixelsChanged++;
                            }
                        }
                    }
                }
            }
            
            // Pass 4: Clean up isolated pixels and small artifacts
            const radius = 2;
            const minNeighbors = 3;
            
            // Create a copy for reading while modifying
            const dataCopy = new Uint8ClampedArray(data);
            
            for (let y = radius; y < canvas.height - radius; y++) {
                for (let x = radius; x < canvas.width - radius; x++) {
                    const centerIndex = (y * canvas.width + x) * 4;
                    
                    // Skip already transparent pixels
                    if (dataCopy[centerIndex + 3] === 0) continue;
                    
                    // Count non-transparent neighbors
                    let opaqueNeighbors = 0;
                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            
                            const neighborIndex = ((y + dy) * canvas.width + (x + dx)) * 4;
                            if (dataCopy[neighborIndex + 3] > 0) {
                                opaqueNeighbors++;
                            }
                        }
                    }
                    
                    // Remove isolated pixels (artifacts)
                    if (opaqueNeighbors < minNeighbors) {
                        data[centerIndex + 3] = 0;
                        pixelsChanged++;
                    }
                }
            }
            
            // Put the modified data back
            ctx.putImageData(imageData, 0, 0);
            
            // Create a new image from the processed canvas
            const processedImg = new Image();
            processedImg.src = canvas.toDataURL('image/png');
            
            if (window.DEBUG_MODE) console.log(`🎨 Enhanced cleaning for ${imageName}: Background RGB(${avgR}, ${avgG}, ${avgB}) - ${pixelsChanged} pixels made transparent`);
            
            return processedImg;
            
        } catch (error) {
            if (window.DEBUG_MODE) console.warn(`❌ Failed to remove background from ${imageName}:`, error);
            return img; // Return original image if processing fails
        }
    }
    
    loadAudio(name, path) {
        return new Promise((resolve, reject) => {
            if (window.DEBUG_MODE) console.log(`🔊 Loading audio: ${name} from ${path}`);
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audio[name] = audio;
                this.loadedAssets++;
                if (window.DEBUG_MODE) console.log(`✅ Audio loaded: ${name} (${audio.duration?.toFixed(2) || 'unknown'}s)`);
                if (this.onProgress) this.onProgress(this.loadedAssets, this.totalAssets);
                resolve(audio);
            };
            audio.onerror = () => {
                // Create silent placeholder for missing audio files
                if (window.DEBUG_MODE) console.warn(`❌ Audio file not found: ${path} - using placeholder`);
                this.audio[name] = { play: () => {}, pause: () => {}, currentTime: 0 };
                this.loadedAssets++;
                if (this.onProgress) this.onProgress(this.loadedAssets, this.totalAssets);
                resolve(this.audio[name]);
            };
            audio.src = path;
        });
    }
    
    async loadAllAssets() {
        if (window.DEBUG_MODE) console.log('🔄 AssetLoader: Starting to load all assets...');
        const imageAssets = [
            { name: 'logo', path: 'images/logo.png' },
            { name: 'hand_idle', path: 'images/hand_idle.png' },
            { name: 'hand_dropping', path: 'images/hand_dropping.png' },
            { name: 'sugar_cube', path: 'images/sugar_cube.png' },
            { name: 'sugar_splash', path: 'images/sugar_splash.png' },
            { name: 'cup_small', path: 'images/cup_small.png' },
            { name: 'cup_medium', path: 'images/cup_medium.png' },
            { name: 'cup_large', path: 'images/cup_large.png' },
            { name: 'conveyor_belt', path: 'images/conveyor_belt.png' },
            { name: 'order_note_blank', path: 'images/order_note_blank.png' }
        ];
        
        const audioAssets = [
            { name: 'sugar_drop', path: 'audio/sugar_drop.mp3' },
            { name: 'success_hit', path: 'audio/success_hit.mp3' },
            { name: 'miss', path: 'audio/miss.mp3' },
            { name: 'sugar_splash', path: 'audio/sugar_splash.mp3' },
            { name: 'level_complete', path: 'audio/level_complete.mp3' },
            { name: 'level_fail', path: 'audio/level_fail.mp3' },
            { name: 'time_warning', path: 'audio/time_warning.mp3' },
            { name: 'game_bgm', path: 'audio/game_bgm.mp3' },
            { name: 'overfill', path: 'audio/overfill.mp3' }
        ];
        
        this.totalAssets = imageAssets.length + audioAssets.length;
        this.loadedAssets = 0;
        
        try {
            const imagePromises = imageAssets.map(asset => 
                this.loadImage(asset.name, asset.path)
            );
            
            const audioPromises = audioAssets.map(asset => 
                this.loadAudio(asset.name, asset.path)
            );
            
            await Promise.all([...imagePromises, ...audioPromises]);
            
            if (window.DEBUG_MODE) {
                console.log(`✅ AssetLoader: All assets loaded! Images: ${Object.keys(this.images).length}, Audio: ${Object.keys(this.audio).length}`);
                console.log(`🖼️ Image assets:`, Object.keys(this.images));
            }
            
            if (this.onComplete) this.onComplete();
            return true;
        } catch (error) {
            console.error('Failed to load assets:', error); // Always log errors
            return false;
        }
    }
    
    getImage(name) {
        return this.images[name];
    }
    
    getAudio(name) {
        return this.audio[name];
    }
    
    getProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
    }
}
