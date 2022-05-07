import resolveConfig from 'tailwindcss/resolveConfig'
//@ts-ignore
import tailwindConfig from '/tailwind.config.js'

const themeConfig = resolveConfig(tailwindConfig)

const base_url = "/"

const version = "1.18.2"
const backend_url = `https://dispenser.gunivers.net/api/${version}`

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
    //@ts-ignore
    background_color: themeConfig.theme.colors.background['100'],
    // @ts-ignore
    wireframe_color: themeConfig.theme.colors.background['500'],
    orbit_speed: 2.0,
    max_orbit_speed: 100.0,
    default_settings: {
        model: "slime_block",
        display_axes: false,
        display_grid: true,
        display_block_frame: false,
        rotate_anim: true,
    }
}
