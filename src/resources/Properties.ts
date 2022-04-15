import resolveConfig from 'tailwindcss/resolveConfig'
//@ts-ignore
import tailwindConfig from '/tailwind.config.js'

const themeConfig = resolveConfig(tailwindConfig)

const version = "1.18.1"
const base_url = `https://dispenser.gunivers.net/api/${version}/`

export const properties = {
    backend: {
        url_texture: `${base_url}/block/texture/`,
        url_model: `${base_url}/block/model/`,
        url_mcmeta: `${base_url}/block/mcmeta/`,
        url_model_list: `${base_url}/block/models/`
    },
    model: {
        block_size: 16,
        texture_animation_frequency: 20
    },
    //@ts-ignore
    background_color: themeConfig.theme.colors.background['500'],
    orbit_speed: 2.0,
    max_orbit_speed: 100.0,
    default_settings: {
        model: "cake",
        display_axes: false,
        display_grid: true,
        display_block_frame: false,
        rotate_anim: true,
    }
}
