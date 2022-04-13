import resolveConfig from 'tailwindcss/resolveConfig'
//@ts-ignore
import tailwindConfig from '/tailwind.config.js'

const themeConfig = resolveConfig(tailwindConfig)

export const properties = {
    backend_url_texture: "https://dispenser.gunivers.net/api/1.18.1/block/texture/",
    backend_url_model: "https://dispenser.gunivers.net/api/1.18.1/block/model/",
    backend_url_mcmeta: "https://dispenser.gunivers.net/api/1.18.1/block/mcmeta/",
    backend_url_all_models: "https://dispenser.gunivers.net/api/1.18.1/block/models/",
    //@ts-ignore
    background_color: themeConfig.theme.colors.background['500'],
    block_size: 16,
    orbit_speed: 2.0,
    max_orbit_speed: 100.0,
    default_settings: {
        model: "slime_block",
        display_axes: true,
        display_grid: true,
        display_block_frame: false,
    }
}
