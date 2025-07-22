import type { App } from "vue";
import CusCarousel from "./CusCarousel.vue";
import CusCarouselItem from "./CusCarouselItem.vue";

CusCarousel.install = function (app: App) {
  app.component('CusCarousel', CusCarousel)
}
CusCarouselItem.install = function (app: App) {
  app.component('CusCarouselItem', CusCarouselItem)
}

export type CusCarouselInstance = InstanceType<typeof CusCarousel>
export type CusCarouselItemInstance = InstanceType<typeof CusCarouselItem>
export { CusCarousel, CusCarouselItem }

