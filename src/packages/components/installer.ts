import { CusCarousel, CusCarouselItem } from "./cus-carousel";

import type { App } from "vue";

const components = {
  CusCarousel,
  CusCarouselItem
}

export default function (Vue: App) {
  for (const key in components) {
    const component = Reflect.get(components, key);
    Vue.use(component);
  }
}
