import resolveConfig from 'tailwindcss/resolveConfig'
// @ts-expect-error

import tailwindConfig from '/tailwind.config.js'

const themeConfig = resolveConfig(tailwindConfig)

var hash = window.location.hash.substr(1);

interface UrlOptions {
    q?: string,
    rotanim?: 'true'|'false',
    interactive?: 'true'|'false',
    embedded?: 'true'|'false',
    zoom?: string,
}

var url_params: UrlOptions = hash.split('&').reduce(function (res, item) {
    var parts = item.split('=');
    // @ts-expect-error
    res[parts[0]] = parts[1];
    return res;
}, {});

const base_url = "/"

const version = "1.18.1"
const backend_url = `https://dispenser.gunivers.net/api/${version}`

console.log(url_params)

export const properties = {
    base_url: base_url,
    backend: {
        url_texture: `${backend_url}/block/texture/`,
        url_model: `${backend_url}/block/model/`,
        url_mcmeta: `${backend_url}/block/mcmeta/`,
        url_model_list: `${backend_url}/block/models/`
    },
    model: {
        block_size: 16,
        texture_animation_frequency: 20,
        play_texture_animation: true
    },
    // @ts-expect-error
    background_color: themeConfig.theme.colors.background['100'],
    // @ts-expect-error
    wireframe_color: themeConfig.theme.colors.background['500'],
    orbit_speed: 2.0,
    max_orbit_speed: 100.0,
    default_settings: {
        model: (url_params.q)? url_params.q : "slime_block",
        display_axes: false,
        display_grid: true,
        display_block_frame: false,
        rotate_anim: (url_params.rotanim == 'false')? false : true,
    },
    interactive: (url_params.interactive == 'false' )? false : true,
    embedded: (url_params.embedded == 'true' )? true : false,
    zoom: (url_params.zoom && Number(url_params.zoom))? Number(url_params.zoom) : 60,
}
