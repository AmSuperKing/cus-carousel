<template>
  <div class="cus-carousel__item" :class="{
    'cus-carousel__item-card-horizontal': context?.isCardMode.value && !context?.isVertical.value,
    'cus-carousel__item-card-vertical': context?.isCardMode.value && context?.isVertical.value,
    'is-active': isActive,
    'is-in-stage': isInStage,
  }" :style="itemStyle" @click="handleItemClick">
    <slot></slot>
    <div v-if="context?.isCardMode.value" class="cus-carousel__mask"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import type { Ref, ComputedRef } from 'vue';

defineOptions({
  name: 'CusCarouselItem',
});

export interface CarouselItemProps {
  readonly label?: string | number;
  readonly name?: string;
}

interface CarouselItem {
  uid: string | number | symbol;
  props?: CarouselItemProps;
}

interface InjectionContext {
  root: Ref<HTMLElement | null, HTMLElement | null>
  isCardMode: ComputedRef<boolean>
  isVertical: ComputedRef<boolean>
  loop: boolean
  items: Ref<CarouselItem[], CarouselItem[]>
  activeIndex: Ref<number, number>
  cardScale: number
  addItem: (item: CarouselItem) => void
  removeItem: (uid: string | number | symbol) => void
  setActiveItem: (target: number | string | symbol) => void
}

const CARD_SCALE = 0.83;
const props = defineProps({
  name: { type: String, default: '' },
  label: { type: [String, Number], default: '' }
});

const instance = getCurrentInstance();
const context = inject<InjectionContext>('carouselContext');

// --- STATE ---
const selfIndex = ref(-1);
const translate = ref(0);
const scale = ref(1);
const zIndex = ref(0);

// --- COMPUTED ---
const isActive = computed(() => context?.activeIndex.value === selfIndex.value);

/**
 * Calculates if the item is "in stage", meaning it's the active, previous, or next card.
 * This determines visibility and clickability in card mode.
 */
const isInStage = computed(() => {
  if (!context?.isCardMode.value) return false;
  const activeIndex = context.activeIndex.value;
  const length = context.items.value.length;
  if (length === 0) return false;

  let offset = selfIndex.value - activeIndex;
  // Handle loop for offset calculation
  if (context?.loop) {
    if (Math.abs(offset) > length / 2) {
      offset = offset > 0 ? offset - length : offset + length;
    }
  }
  return Math.abs(offset) <= 1;
});

const itemStyle = computed(() => ({
  transform: `translate${context?.isVertical.value ? 'Y' : 'X'}(${translate.value}px) scale(${scale.value})`,
  zIndex: zIndex.value,
}));

// --- METHODS ---

/**
 * The core logic to calculate the position, scale, and z-index of each item.
 * This is the heart of the card mode's visual effect.
 */
const processStyle = () => {
  const activeIndex = context!.activeIndex.value;
  const length = context!.items.value.length;
  if (length === 0 || selfIndex.value === -1) return;

  const scrollDistance = context!.isVertical.value ? context!.root.value!.offsetHeight : context!.root.value!.offsetWidth;
  const cardWidth = context?.isCardMode.value ? scrollDistance * 0.5 : scrollDistance; // Card width is 50% of container
  let offset = selfIndex.value - activeIndex;

  // Handle loop for offset calculation
  if (context!.loop) {
    if (Math.abs(offset) > length / 2) {
      offset = offset > 0 ? offset - length : offset + length;
    }
  }

  // Set style based on the offset from the active item
  if (offset === 0) {
    // Active card in the center
    translate.value = 0;
    scale.value = 1;
    zIndex.value = 2;
  } else if (Math.abs(offset) === 1) {
    // Previous and Next cards on the sides
    const sign = offset > 0 ? 1 : -1;
    // This formula positions the side cards correctly
    translate.value = context?.isCardMode.value ? sign * (scrollDistance / 2 - cardWidth / 2 + cardWidth * (1 - (context.cardScale || CARD_SCALE)) / 2) : (selfIndex.value - context!.activeIndex.value) * scrollDistance;

    scale.value = context?.isCardMode.value ? (context.cardScale || CARD_SCALE) : 1;
    zIndex.value = 1;
  } else {
    // Cards that are out of stage (hidden)
    let sign = offset > 0 ? 1 : -1;
    translate.value = context?.isCardMode.value ? sign * scrollDistance : (selfIndex.value - context!.activeIndex.value) * scrollDistance;

    if (context?.isCardMode.value) {
      if (selfIndex.value === context!.items.value.length - 1 && context!.activeIndex.value === 0) {
        if (translate.value > 0) {
          sign = -1
          translate.value = sign * (scrollDistance / 2 - cardWidth / 2 + cardWidth * (1 - (context.cardScale || CARD_SCALE)) / 2);
        }
      }

      if (selfIndex.value === 0 && context!.activeIndex.value === context!.items.value.length - 1) {
        if (translate.value < 0) {
          sign = 1
          translate.value = sign * (scrollDistance / 2 - cardWidth / 2 + cardWidth * (1 - (context.cardScale || CARD_SCALE)) / 2);
        }
      }
    }

    scale.value = context?.isCardMode.value ? (context.cardScale || CARD_SCALE) : 1;
    zIndex.value = 0;
  }
};


const handleItemClick = () => {
  if (context?.isCardMode.value && !isActive.value) {
    context.setActiveItem(selfIndex.value);
  }
};

const symbolKey = Symbol();
const resizeObserver = new ResizeObserver(() => {
  processStyle()
});

if (!context) {
  throw new Error(`
    [CusCarouselItem] must be used inside [CusCarousel].
    usage: <cus-carousel><cus-carousel-item>...</cus-carousel></cus-carousel>
  `);
}

// --- LIFECYCLE & WATCHERS ---
onMounted(() => {
  context?.addItem({ uid: instance?.uid || symbolKey, props });
  selfIndex.value = (context?.items.value.length || 1) - 1;
  // Initial style calculation after the DOM is ready
  setTimeout(processStyle, 0);

  resizeObserver.observe(context!.root.value as Element)
});

onUnmounted(() => {
  resizeObserver.unobserve(context!.root.value as Element)
  context?.removeItem(instance?.uid || symbolKey);
});

// Re-calculate styles whenever the active index or item list changes
watch(() => context?.activeIndex.value, processStyle);
watch(() => context?.items.value.length, processStyle);
</script>

<style lang="scss" scoped>
.cus-carousel__item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: inline-block;
  overflow: hidden;
  z-index: 1;
  transition: transform .4s ease-in-out;

  &-card-horizontal {
    cursor: pointer;
    left: 25%;
  }

  &-card-vertical {
    cursor: pointer;
    top: 25%;
  }
}

/* Card Mode Specific Styles */
.cus-carousel--card {
  & .cus-carousel__item-card-horizontal {
    width: 50%;
    cursor: pointer;
  }

  & .cus-carousel__item-card-vertical {
    height: 50%;
    cursor: pointer;
  }

  // & .cus-carousel__item.is-in-stage {
  //   /* Visible and clickable */
  // }

  // & .cus-carousel__item.is-active {
  //   /* The center card */
  // }
}

.cus-carousel__mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #fff;
  opacity: 0.34;
  transition: opacity .3s;
}

.cus-carousel--card .cus-carousel__item.is-in-stage:hover .cus-carousel__mask,
.cus-carousel--card .cus-carousel__item.is-active .cus-carousel__mask {
  opacity: 0;
}
</style>
