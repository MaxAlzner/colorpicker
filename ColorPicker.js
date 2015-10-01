
var ColorPicker = (function () {
    'use strict';

    var _color = { r: 255, g: 255, b: 255 },
        _base = { r: 255, g: 255, b: 255 },
        _hue = 0,
        _saturation = 100,
        _lightness = 100,
        _shadeGradient = $('#ShadePickerGradient'),
        _shadeCursor = $('#ShadePickerCursor'),
        _hueGradient = $('#HuePickerGradient'),
        _hueCursor = $('#HuePickerCursor'),
        _hexInput = $('#HexValueInput'),
        _redInput = $('#RedValueInput'),
        _greenInput = $('#GreenValueInput'),
        _blueInput = $('#BlueValueInput'),
        _hueInput = $('#HueValueInput'),
        _saturationInput = $('#SaturationValueInput'),
        _lightnessInput = $('#LightnessValueInput'),
        _grayView = $('#GrayValueLabel'),
        _view = $('#ColorViewLabel')
        ;

    function _lerpNumber(x, y, t) {
        return ((y - x) * t) + x;
    }

    function _ensureNumber(x, precision) {
        if (x && !isNaN(x)) {
            precision = isNaN(precision) ? 8 : Math.floor(precision);
            precision = Math.pow(10, precision);
            return Math.floor(x * precision) / precision;
        }
        return 0;
    }

    function _ensureColor(x) {
        if (x) {
            var _r = isNaN(x.r) ? 0 : _ensureNumber(Math.min(Math.max(x.r, 0), 255)),
                _g = isNaN(x.g) ? 0 : _ensureNumber(Math.min(Math.max(x.g, 0), 255)),
                _b = isNaN(x.b) ? 0 : _ensureNumber(Math.min(Math.max(x.b, 0), 255))
                ;
            _r = Math.round(Math.round(_r * 1000) / 1000);
            _g = Math.round(Math.round(_g * 1000) / 1000);
            _b = Math.round(Math.round(_b * 1000) / 1000);
            _r = Math.round(Math.round(_r * 100) / 100);
            _g = Math.round(Math.round(_g * 100) / 100);
            _b = Math.round(Math.round(_b * 100) / 100);
            return {
                r: _r,
                g: _g,
                b: _b
            };
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _parseColor(str) {
        var d = document.createElement('div'),
            c = null
            ;
        d.style.color = str;
        c = getComputedStyle(d).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (c) {
            return {
                r: Math.min(Math.max(parseInt(c[1], 10), 0), 255),
                g: Math.min(Math.max(parseInt(c[2], 10), 0), 255),
                b: Math.min(Math.max(parseInt(c[3], 10), 0), 255)
            };
        }
        else {
            throw new Error('Color ' + str + ' could not be parsed.');
        }
    }

    function _packColor(x) {
        if (x) {
            x = _ensureColor(x);
            var _r = x.r.toString(16).toUpperCase(),
                _g = x.g.toString(16).toUpperCase(),
                _b = x.b.toString(16).toUpperCase()
                ;
            return '#' + (_r.length < 2 ? '0' + _r : _r) + (_g.length < 2 ? '0' + _g : _g) + (_b.length < 2 ? '0' + _b : _b);
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _lerpColor(x, y, t) {
        if (x && !isNaN(x.r) && !isNaN(x.g) && !isNaN(x.b)) {
            return _ensureColor({
                r: _lerpNumber(x.r, y.r, t),
                g: _lerpNumber(x.g, y.g, t),
                b: _lerpNumber(x.b, y.b, t)
            });
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _grayColor(x) {
        if (x) {
            x = _ensureColor(x);
            return Math.round((0.2126 * x.r) + (0.7152 * x.g) + (0.0722 * x.b));
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _getLightnessFromColor(x) {
        if (x) {
            x = _ensureColor(x);
            var max = Math.max(Math.max(x.r / 255, x.g / 255), x.b / 255),
                min = Math.min(Math.min(x.r / 255, x.g / 255), x.b / 255)
                ;
            return ((max + min) / 2) * 100;
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _getSaturationFromColor(x) {
        if (x) {
            x = _ensureColor(x);
            var max = Math.max(Math.max(x.r / 255, x.g / 255), x.b / 255),
                min = Math.min(Math.min(x.r / 255, x.g / 255), x.b / 255),
                delta = max - min,
                sum = max + min,
                l = sum / 2
                ;
            if (delta === 0) {
                return 0;
            }
            return (l > 0.5 ? delta / (2 - max - min) : delta / sum) * 100;
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _getHueFromColor(x) {
        if (x) {
            x = _ensureColor(x);
            var max = Math.max(Math.max(x.r / 255, x.g / 255), x.b / 255),
                min = Math.min(Math.min(x.r / 255, x.g / 255), x.b / 255),
                delta = max - min,
                r = x.r / 255,
                g = x.g / 255,
                b = x.b / 255,
                h = 0
                ;
            if (delta === 0) {
                return 0;
            }
            /*jshint white: false */
            switch (max) {
                case r: h = ((g - b) / delta) + (g < b ? 6 : 0); break;
                case g: h = ((b - r) / delta) + 2; break;
                case b: h = ((r - g) / delta) + 4; break;
            }
            return Math.round((h / 6) * 360);
        }
        else {
            throw new Error('Color ' + JSON.stringify(x) + ' is not valid.');
        }
    }

    function _hslToColor(h, s, l) {
        var _r = 0,
            _g = 0,
            _b = 0,
            _h = (h % 360) / 360,
            _s = Math.min(Math.max(s, 0), 100) / 100,
            _l = Math.min(Math.max(l, 0), 100) / 100,
            q = 0,
            p = 0,
            c = function (p, q, t) {
                if (t < 0) {
                    t += 1;
                }
                if (t > 1) {
                    t -= 1;
                }
                if (t < (1 / 6)) {
                    return p + (q - p) * 6 * t;
                }
                if (t < 0.5) {
                    return q;
                }
                if (t < (2 / 3)) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                }
                return p;
            }
            ;
        if (_s === 0) {
            _r = _l;
            _g = _l;
            _b = _l;
        }
        else {
            q = _l < 0.5 ? _l * (1 + _s) : _l + _s - _l * _s;
            p = 2 * _l - q;
            _r = c(p, q, _h + 1 / 3);
            _g = c(p, q, _h);
            _b = c(p, q, _h - 1 / 3);
        }

        return _ensureColor({
            r: _r * 255,
            g: _g * 255,
            b: _b * 255
        });
    }

    function _getColorFromHue(h) {
        var hues = [
                { r: 255, g: 0, b: 0 },
                { r: 255, g: 255, b: 0 },
                { r: 0, g: 255, b: 0 },
                { r: 0, g: 255, b: 255 },
                { r: 0, g: 0, b: 255 },
                { r: 255, g: 0, b: 255 },
                { r: 255, g: 0, b: 0 }
            ],
            i = Math.floor(h / 60),
            k = i + 1,
            t = (h % 60) / 60
            ;
        return _lerpColor(hues[i], hues[k], t);
    }

    function _setShadePickerPos(u, v) {
        var w = _shadeGradient.width(),
            h = _shadeGradient.height(),
            position = _shadeGradient.offset(),
            offset = {
                x: Math.floor(_shadeCursor.width() / 2),
                y: Math.floor(_shadeCursor.height() / 2)
            }
            ;
        if (!isNaN(u)) {
            _shadeCursor.css('left', (Math.round(position.left + (u * w)) - offset.x) + 'px');
        }
        if (!isNaN(v)) {
            v = 1 - v;
            _shadeCursor.css('top', (Math.round(position.top + (v * h)) - offset.y) + 'px');
        }
    }

    function _setHuePickerPos(v) {
        var w = _hueGradient.width(),
            h = _hueGradient.height(),
            position = _hueGradient.offset(),
            offset = {
                x: Math.floor(_hueCursor.width() / 2),
                y: Math.floor(_hueCursor.height() / 2)
            }
            ;
        if (!isNaN(v)) {
            v = 1 - v;
            _hueCursor.css('left', (Math.round(position.left + (0.5 * w)) - offset.x + 1) + 'px');
            _hueCursor.css('top', (Math.round(position.top + (v * h)) - offset.y) + 'px');
        }
    }

    function _insideShadePicker(x, y) {
        var w = _shadeGradient.width(),
            h = _shadeGradient.height(),
            position = _shadeGradient.offset()
            ;
        if (!isNaN(x) && !isNaN(y)) {
            return x >= position.left && y >= position.top && x <= (position.left + w) && y <= (position.top + h);
        }
        return false;
    }

    function _insideHuePicker(x, y) {
        var w = _hueGradient.width(),
            h = _hueGradient.height(),
            position = _hueGradient.offset()
            ;
        if (!isNaN(x) && !isNaN(y)) {
            return x >= position.left && y >= position.top && x <= (position.left + w) && y <= (position.top + h);
        }
        return false;
    }

    function _refreshShadeCursor(u, v) {
        if (u && v && !isNaN(u) && !isNaN(v)) {
            _saturation = Math.min(Math.max(u * 100, 0), 100);
            _lightness = Math.min(Math.max(v * 100, 0), 100);
            _color = _hslToColor(_hue, _saturation, _lightness);
            ColorPicker.Refresh();
        }
    }

    function _refreshHueCursor(v) {
        if (v && !isNaN(v)) {
            _hue = Math.round(v * 360) % 360;
            _base = _getColorFromHue(_hue);
            _color = _hslToColor(_hue, _saturation, _lightness);
            ColorPicker.Refresh();
        }
    }

    function _refreshHex(str) {
        if (str) {
            if (str === _packColor(_color)) {
                return;
            }

            try {
                _color = _parseColor(str);
                _hue = _getHueFromColor(_color);
                _saturation = _getSaturationFromColor(_color);
                _lightness = _getLightnessFromColor(_color);
                _base = _getColorFromHue(_hue);
            }
            catch (error) {
                throw error;
            }
            ColorPicker.Refresh();
        }
    }

    function _refreshRed(x) {
        if (x) {
            if (x === _color.r) {
                return;
            }

            _color.r = Math.min(Math.max(x, 0), 255);
            _hue = _getHueFromColor(_color);
            _saturation = _getSaturationFromColor(_color);
            _lightness = _getLightnessFromColor(_color);
            _base = _getColorFromHue(_hue);
            ColorPicker.Refresh();
        }
    }

    function _refreshGreen(x) {
        if (x) {
            if (x === _color.g) {
                return;
            }

            _color.g = Math.min(Math.max(x, 0), 255);
            _hue = _getHueFromColor(_color);
            _saturation = _getSaturationFromColor(_color);
            _lightness = _getLightnessFromColor(_color);
            _base = _getColorFromHue(_hue);
            ColorPicker.Refresh();
        }
    }

    function _refreshBlue(x) {
        if (x) {
            if (x === _color.b) {
                return;
            }

            _color.b = Math.min(Math.max(x, 0), 255);
            _hue = _getHueFromColor(_color);
            _saturation = _getSaturationFromColor(_color);
            _lightness = _getLightnessFromColor(_color);
            _base = _getColorFromHue(_hue);
            ColorPicker.Refresh();
        }
    }

    function _refreshHue(x) {
        if (x) {
            if (x === _hue) {
                return;
            }

            _hue = Math.min(Math.max(x, 0), 359);
            _base = _getColorFromHue(_hue);
            _color = _hslToColor(_hue, _saturation, _lightness);
            ColorPicker.Refresh();
        }
    }

    function _refreshSaturation(x) {
        if (x) {
            _saturation = Math.min(Math.max(x, 0), 100);
            _color = _hslToColor(_hue, _saturation, _lightness);
            ColorPicker.Refresh();
        }
    }

    function _refreshLightness(x) {
        if (x) {
            _lightness = Math.min(Math.max(x, 0), 100);
            _color = _hslToColor(_hue, _saturation, _lightness);
            ColorPicker.Refresh();
        }
    }

    function _refreshShadePicker() {
        $.each(_shadeGradient, function (key, value) {
            var w = value.width,
                h = value.height,
                ctx = value.getContext("2d"),
                gradient = null,
                left = null,
                right = null,
                t = 0,
                i;
            if (ctx) {
                for (i = 0; i < h; i += 1) {
                    t = (i + 1) / h;
                    left = _lerpColor({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, t);
                    if (t < 0.5) {
                        right = _lerpColor({ r: 255, g: 255, b: 255 }, _base, t * 2);
                    }
                    else {
                        right = _lerpColor(_base, { r: 0, g: 0, b: 0 }, (t * 2) - 1);
                    }

                    gradient = ctx.createLinearGradient(0, 0, w, 0);
                    gradient.addColorStop(0, 'rgb(' + left.r + ', ' + left.g + ', ' + left.b + ')');
                    gradient.addColorStop(1, 'rgb(' + right.r + ', ' + right.g + ', ' + right.b + ')');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, i, w, 1);
                }
            }
        });
    }

    function _refreshHuePicker() {
        $.each(_hueGradient, function (key, value) {
            var w = value.width,
                h = value.height,
                ctx = value.getContext("2d"),
                gradient = ctx.createLinearGradient(0, 0, 0, h)
                ;
            gradient.addColorStop(0, '#F00');
            gradient.addColorStop(1 / 6, '#F0F');
            gradient.addColorStop(2 / 6, '#00F');
            gradient.addColorStop(3 / 6, '#0FF');
            gradient.addColorStop(4 / 6, '#0F0');
            gradient.addColorStop(5 / 6, '#FF0');
            gradient.addColorStop(1, '#F00');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        });
    }
    
    window.onresize = function ()
    {
        ColorPicker.Refresh();
    };
    
    return {
        Initialize: function () {
            _setShadePickerPos(1, 1);
            _setHuePickerPos(1);
            _refreshHuePicker();

            /*
            console.log('Lightness Test');
            console.log(_getLightnessFromColor({ r: 0, g: 0, b: 0 }) + ' shoulde be 0%');
            console.log(_getLightnessFromColor({ r: 255, g: 255, b: 255 }) + ' shoulde be 100%');
            console.log(_getLightnessFromColor({ r: 255, g: 0, b: 0 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 0, g: 255, b: 0 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 0, g: 0, b: 255 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 255, g: 255, b: 0 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 0, g: 255, b: 255 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 255, g: 0, b: 255 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 192, g: 192, b: 192 }) + ' shoulde be 75%');
            console.log(_getLightnessFromColor({ r: 128, g: 128, b: 128 }) + ' shoulde be 50%');
            console.log(_getLightnessFromColor({ r: 128, g: 0, b: 0 }) + ' shoulde be 25%');
            console.log(_getLightnessFromColor({ r: 128, g: 128, b: 0 }) + ' shoulde be 25%');
            console.log(_getLightnessFromColor({ r: 0, g: 128, b: 0 }) + ' shoulde be 25%');
            console.log(_getLightnessFromColor({ r: 128, g: 0, b: 128 }) + ' shoulde be 25%');
            console.log(_getLightnessFromColor({ r: 0, g: 128, b: 128 }) + ' shoulde be 25%');
            console.log(_getLightnessFromColor({ r: 0, g: 0, b: 128 }) + ' shoulde be 25%');

            console.log('Saturation Test');
            console.log(_getSaturationFromColor({ r: 0, g: 0, b: 0 }) + ' shoulde be 0%');
            console.log(_getSaturationFromColor({ r: 255, g: 255, b: 255 }) + ' shoulde be 0%');
            console.log(_getSaturationFromColor({ r: 255, g: 0, b: 0 }) + ' shoulde be 100%');
            console.log(_getSaturationFromColor({ r: 0, g: 255, b: 0 }) + ' shoulde be 100%');
            console.log(_getSaturationFromColor({ r: 0, g: 0, b: 255 }) + ' shoulde be 100%');
            console.log(_getSaturationFromColor({ r: 192, g: 192, b: 192 }) + ' shoulde be 0%');
            console.log(_getSaturationFromColor({ r: 0, g: 0, b: 128 }) + ' shoulde be 100%');
            console.log(_getSaturationFromColor({ r: 115, g: 104, b: 192 }) + ' shoulde be 41.1%');
            console.log(_getSaturationFromColor({ r: 224, g: 16, b: 61 }) + ' shoulde be 86.7%');
            console.log(_getSaturationFromColor({ r: 13, g: 200, b: 90 }) + ' shoulde be 87.8%');
            console.log(_getSaturationFromColor({ r: 1, g: 0, b: 226 }) + ' shoulde be 100%');
            console.log(_getSaturationFromColor({ r: 25, g: 207, b: 226 }) + ' shoulde be 80.1%');
            console.log(_getSaturationFromColor({ r: 241, g: 207, b: 226 }) + ' shoulde be 54.8%');

            console.log('Hue Test');
            console.log(_getHueFromColor({ r: 0, g: 0, b: 0 }) + ' shoulde be 0');
            console.log(_getHueFromColor({ r: 255, g: 255, b: 255 }) + ' shoulde be 0');
            console.log(_getHueFromColor({ r: 255, g: 0, b: 0 }) + ' shoulde be 0');
            console.log(_getHueFromColor({ r: 0, g: 255, b: 0 }) + ' shoulde be 120');
            console.log(_getHueFromColor({ r: 0, g: 0, b: 255 }) + ' shoulde be 240');
            console.log(_getHueFromColor({ r: 255, g: 255, b: 0 }) + ' shoulde be 60');
            console.log(_getHueFromColor({ r: 0, g: 255, b: 255 }) + ' shoulde be 180');
            console.log(_getHueFromColor({ r: 255, g: 0, b: 255 }) + ' shoulde be 300');
            console.log(_getHueFromColor({ r: 192, g: 192, b: 192 }) + ' shoulde be 0');
            console.log(_getHueFromColor({ r: 128, g: 128, b: 128 }) + ' shoulde be 0');
            console.log(_getHueFromColor({ r: 128, g: 0, b: 0 }) + ' shoulde be 0');
            console.log(_getHueFromColor({ r: 128, g: 128, b: 0 }) + ' shoulde be 60');
            console.log(_getHueFromColor({ r: 0, g: 128, b: 0 }) + ' shoulde be 120');
            console.log(_getHueFromColor({ r: 128, g: 0, b: 128 }) + ' shoulde be 300');
            console.log(_getHueFromColor({ r: 0, g: 128, b: 128 }) + ' shoulde be 180');
            console.log(_getHueFromColor({ r: 0, g: 0, b: 128 }) + ' shoulde be 240');

            console.log('HSL To Color Test');
            console.log(_packColor(_hslToColor(0, 0, 0)) + ' should be #000000');
            console.log(_packColor(_hslToColor(0, 0, 100)) + ' should be #FFFFFF');
            console.log(_packColor(_hslToColor(0, 100, 50)) + ' should be #FF0000');
            console.log(_packColor(_hslToColor(120, 100, 50)) + ' should be #00FF00');
            console.log(_packColor(_hslToColor(240, 100, 50)) + ' should be #0000FF');
            console.log(_packColor(_hslToColor(60, 100, 50)) + ' should be #FFFF00');
            console.log(_packColor(_hslToColor(180, 100, 50)) + ' should be #00FFFF');
            console.log(_packColor(_hslToColor(300, 100, 50)) + ' should be #FF00FF');
            console.log(_packColor(_hslToColor(0, 0, 75)) + ' should be #C0C0C0');
            console.log(_packColor(_hslToColor(0, 0, 50)) + ' should be #808080');
            console.log(_packColor(_hslToColor(0, 100, 25)) + ' should be #800000');
            console.log(_packColor(_hslToColor(60, 100, 25)) + ' should be #808000');
            console.log(_packColor(_hslToColor(120, 100, 25)) + ' should be #008000');
            console.log(_packColor(_hslToColor(300, 100, 25)) + ' should be #800080');
            console.log(_packColor(_hslToColor(180, 100, 25)) + ' should be #008080');
            console.log(_packColor(_hslToColor(240, 100, 25)) + ' should be #000080');
            console.log(JSON.stringify(_hslToColor(0, 0, 0)) + ' should be { r: 0, g: 0, b: 0 }');
            console.log(JSON.stringify(_hslToColor(0, 0, 100)) + ' should be { r: 255, g: 255, b: 255 }');
            console.log(JSON.stringify(_hslToColor(0, 100, 50)) + ' should be { r: 255, g: 0, b: 0 }');
            console.log(JSON.stringify(_hslToColor(120, 100, 50)) + ' should be { r: 0, g: 255, b: 0 }');
            console.log(JSON.stringify(_hslToColor(240, 100, 50)) + ' should be { r: 0, g: 0, b: 255 }');
            console.log(JSON.stringify(_hslToColor(60, 100, 50)) + ' should be { r: 255, g: 255, b: 0 }');
            console.log(JSON.stringify(_hslToColor(180, 100, 50)) + ' should be { r: 0, g: 255, b: 255 }');
            console.log(JSON.stringify(_hslToColor(300, 100, 50)) + ' should be { r: 255, g: 0, b: 255 }');
            console.log(JSON.stringify(_hslToColor(0, 0, 75)) + ' should be { r: 192, g: 192, b: 192 }');
            console.log(JSON.stringify(_hslToColor(0, 0, 50)) + ' should be { r: 128, g: 128, b: 128 }');
            console.log(JSON.stringify(_hslToColor(0, 100, 25)) + ' should be { r: 128, g: 0, b: 0 }');
            console.log(JSON.stringify(_hslToColor(60, 100, 25)) + ' should be { r: 128, g: 128, b: 0 }');
            console.log(JSON.stringify(_hslToColor(120, 100, 25)) + ' should be { r: 0, g: 128, b: 0 }');
            console.log(JSON.stringify(_hslToColor(300, 100, 25)) + ' should be { r: 128, g: 0, b: 128 }');
            console.log(JSON.stringify(_hslToColor(180, 100, 25)) + ' should be { r: 0, g: 128, b: 128 }');
            console.log(JSON.stringify(_hslToColor(240, 100, 25)) + ' should be { r: 0, g: 0, b: 128 }');
            console.log(JSON.stringify(_hslToColor(248, 41.1, 58)) + ' shoulde be { r: 115, g: 104, b: 192 }');
            console.log(JSON.stringify(_hslToColor(347, 86.7, 47.1)) + ' shoulde be { r: 224, g: 16, b: 61 }');
            console.log(JSON.stringify(_hslToColor(145, 87.8, 41.8)) + ' shoulde be { r: 13, g: 200, b: 90 }');
            console.log(JSON.stringify(_hslToColor(240, 100, 44.3)) + ' shoulde be { r: 1, g: 0, b: 226 }');
            console.log(JSON.stringify(_hslToColor(186, 80.1, 49.2)) + ' shoulde be { r: 25, g: 207, b: 226 }');
            console.log(JSON.stringify(_hslToColor(326, 54.8, 87.8)) + ' shoulde be { r: 241, g: 207, b: 226 }');
            */

            var cursorActive = false;
            $(document).mousedown(function (e) {
                cursorActive = true;
                if (_insideShadePicker(e.pageX, e.pageY) || _insideHuePicker(e.pageX, e.pageY)) {
                    e.preventDefault();
                }
            });
            $(document).mouseup(function (e) {
                cursorActive = false;
                if (_insideShadePicker(e.pageX, e.pageY) || _insideHuePicker(e.pageX, e.pageY)) {
                    e.preventDefault();
                }
            });
            $(document).mousemove(function (e) {
                var w = 0,
                    h = 0,
                    position = null
                    ;
                if (cursorActive) {
                    if (_insideShadePicker(e.pageX, e.pageY)) {
                        w = _shadeGradient.width();
                        h = _shadeGradient.height();
                        position = _shadeGradient.offset();
                        _refreshShadeCursor(Math.min(Math.max((e.pageX - position.left) / w, 0), 1), 1 - Math.min(Math.max((e.pageY - position.top) / h, 0), 1));
                    }

                    if (_insideHuePicker(e.pageX, e.pageY)) {
                        h = _hueGradient.height();
                        position = _hueGradient.offset();
                        _refreshHueCursor(1 - Math.min(Math.max((e.pageY - position.top) / h, 0), 1));
                    }
                }
            });
            _shadeGradient.click(function (e) {
                var w = _shadeGradient.width(),
                    h = _shadeGradient.height(),
                    position = _shadeGradient.offset()
                    ;
                if (_insideShadePicker(e.pageX, e.pageY)) {
                    e.preventDefault();
                    _refreshShadeCursor(Math.min(Math.max((e.pageX - position.left) / w, 0), 1), 1 - Math.min(Math.max((e.pageY - position.top) / h, 0), 1));
                }
            });
            _hueGradient.click(function (e) {
                var h = _hueGradient.height(),
                    position = _hueGradient.offset()
                    ;
                if (_insideHuePicker(e.pageX, e.pageY)) {
                    e.preventDefault();
                    _refreshHueCursor(1 - Math.min(Math.max((e.pageY - position.top) / h, 0), 1));
                }
            });
            _hexInput.on('focusout', function (e) {
                _refreshHex(e.target.value);
            });
            _redInput.on('focusout', function (e) {
                _refreshRed(e.target.value);
            });
            _greenInput.on('focusout', function (e) {
                _refreshGreen(e.target.value);
            });
            _blueInput.on('focusout', function (e) {
                _refreshBlue(e.target.value);
            });
            _hueInput.on('focusout', function (e) {
                _refreshHue(e.target.value);
            });
            _saturationInput.on('focusout', function (e) {
                _refreshSaturation(e.target.value);
            });
            _lightnessInput.on('focusout', function (e) {
                _refreshLightness(e.target.value);
            });
        },
        SetColor: function (r, g, b) {
            _base.r = r;
            _base.g = g;
            _base.b = b;
            _hue = _getHueFromColor(_base);
            _saturation = _getSaturationFromColor(_base);
            _lightness = _getLightnessFromColor(_base);
            _color = _hslToColor(_hue, _saturation, _lightness);
            ColorPicker.Refresh();
        },
        Refresh: function () {
            _redInput.val(_color.r.toString());
            _greenInput.val(_color.g.toString());
            _blueInput.val(_color.b.toString());
            _hueInput.val(_hue.toString());
            _saturationInput.val(_ensureNumber(_saturation, 2).toString());
            _lightnessInput.val(_ensureNumber(_lightness, 2).toString());
            _hexInput.val(_packColor(_color));
            _grayView.text(_grayColor(_color).toString());
            _view.css('background-color', 'rgb(' + _color.r + ', ' + _color.g + ', ' + _color.b + ')');
            _refreshShadePicker();
            _setShadePickerPos(_saturation / 100, _lightness / 100);
            _setHuePickerPos(_hue / 360);
        }
    };
} ());

$(window.document).ready(function () {
    'use strict';
    
    ColorPicker.Initialize();
    
    ColorPicker.SetColor(255, 0, 0);
});