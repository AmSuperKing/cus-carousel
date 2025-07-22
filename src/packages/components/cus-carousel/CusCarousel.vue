<template>
  <div ref="root" class="cus-carousel" :class="carouselClasses" tabindex="0" @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave" @keydown.arrow-left.prevent="throttledArrowClick(activeIndex - 1)"
    @keydown.arrow-right.prevent="throttledArrowClick(activeIndex + 1)"
    @keydown.arrow-up.prevent="throttledArrowClick(activeIndex - 1)"
    @keydown.arrow-down.prevent="throttledArrowClick(activeIndex + 1)">
    <div class="cus-carousel__container" :style="{ height: height }">
      <!-- Arrow Left -->
      <slot name="arrows" :arrowDisplay="arrowDisplay" :isHovering="isHovering" :prev="prev" :next="next">
        <transition v-if="arrowDisplay" name="carousel-arrow-left">
          <button v-show="props.arrow === 'always' || (props.arrow === 'hover' && isHovering)" type="button"
            class="cus-carousel__arrow cus-carousel__arrow--left" @click.stop="throttledArrowClick(activeIndex - 1)">
            <svg viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
            </svg>
          </button>
        </transition>
        <!-- Arrow Right -->
        <transition v-if="arrowDisplay" name="carousel-arrow-right">
          <button v-show="props.arrow === 'always' || (props.arrow === 'hover' && isHovering)" type="button"
            class="cus-carousel__arrow cus-carousel__arrow--right" @click.stop="throttledArrowClick(activeIndex + 1)">
            <svg viewBox="0 0 24 24">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="currentColor" />
            </svg>
          </button>
        </transition>
      </slot>
      <!-- carousel items -->
      <slot></slot>
    </div>
    <!-- Indicators -->
    <slot name="indicators" :items="items" :activeIndex="activeIndex" :setActiveItem="setActiveItem">
      <ul v-if="indicatorPosition !== 'none'" class="cus-carousel__indicators" :class="indicatorsClasses">
        <li v-for="(item, index) in items" :key="index" class="cus-carousel__indicator"
          :class="{ 'is-active': index === activeIndex }" @mouseenter="throttledIndicatorHover(index)"
          @click.stop="handleIndicatorClick(index)">
          <button class="cus-carousel__button">
            <span v-if="item.props.label">{{ item.props.label }}</span>
          </button>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, provide, onMounted, onBeforeUnmount, unref, toRef } from 'vue';

defineOptions({
  name: 'CusCarousel',
});

/**
 * 组件Props
 * @param height carousel 的高度
 * @param initialIndex 初始状态激活的幻灯片的索引，从 0 开始
 * @param trigger 指示器的触发方式
 * @param autoplay 是否自动切换
 * @param interval 自动切换的时间间隔，单位为毫秒
 * @param indicatorPosition 指示器的内外位置
 * @param indicatorPlace 指示器的排放位置
 * @param indicatorNormalColor 默认指示器的颜色
 * @param indicatorActiveColor 当前激活的默认指示器的颜色
 * @param arrow 切换箭头的显示时机
 * @param type carousel 的类型
 * @param cardScale 当 type 为 card 时，二级卡的缩放大小
 * @param loop 是否循环显示
 * @param direction 展示的方向
 * @param pauseOnHover 鼠标悬浮时暂停自动切换
 */

export interface CarouselProps {
  height?: string;
  initialIndex?: number;
  trigger?: 'click' | 'hover';
  autoplay?: boolean;
  interval?: number;
  indicatorPosition?: '' | 'outside' | 'none';
  indicatorPlace?: '' | 'top' | 'bottom' | 'left' | 'right' | 'none';
  indicatorNormalColor?: string;
  indicatorActiveColor?: string;
  arrow?: 'always' | 'never' | 'hover';
  type?: 'card' | '';
  cardScale?: number;
  loop?: boolean;
  direction?: 'horizontal' | 'vertical';
  pauseOnHover?: boolean;
}

interface CarouselItemProps {
  readonly label: string | number;
  readonly name: string;
}

interface CarouselItem {
  uid: string | number | symbol;
  props: CarouselItemProps;
}

const props = withDefaults(defineProps<CarouselProps>(), {
  height: '300px',
  initialIndex: 0,
  trigger: 'hover',
  autoplay: true,
  interval: 3000,
  indicatorPosition: '',
  indicatorPlace: '',
  indicatorNormalColor: '#c0c4cc',
  indicatorActiveColor: '#409eff',
  arrow: 'hover',
  type: '',
  cardScale: 0.83,
  loop: true,
  direction: 'horizontal',
  pauseOnHover: true
});

/**
 * @description 当前展示的幻灯片切换时触发，它有两个参数， 一个是新幻灯片的索引，另一个是旧幻灯片的索引
 */
const emit = defineEmits<{
  (e: 'change', index: number, oldIndex: number): void;
}>();

// --- STATE ---
const root = ref<HTMLElement | null>(null);
const items = ref<CarouselItem[]>([]);
const activeIndex = ref(props.initialIndex);
const isHovering = ref(false);
let timer: number | undefined = undefined;
const indicatorNormalColor = toRef(props, 'indicatorNormalColor');
const indicatorActiveColor = toRef(props, 'indicatorActiveColor');

// --- COMPUTED ---
const isCardMode = computed(() => props.type === 'card');
const isVertical = computed(() => props.direction === 'vertical');
const arrowDisplay = computed(() => props.arrow !== 'never' && !unref(isVertical));
const hasLabel = computed(() => items.value.some(item => item.props.label));

const carouselClasses = computed(() => ({
  'cus-carousel--card': isCardMode.value,
  'cus-carousel--vertical': isVertical.value
}));

const indicatorsClasses = computed(() => ({
  'cus-carousel__indicators--horizontal': !isVertical.value,
  'cus-carousel__indicators--vertical': isVertical.value,
  'cus-carousel__indicators--top': !isVertical.value && props.indicatorPlace && props.indicatorPlace === 'top',
  'cus-carousel__indicators--bottom': !isVertical.value && (!props.indicatorPlace || props.indicatorPlace === 'bottom'),
  'cus-carousel__indicators--left': isVertical.value && props.indicatorPlace && props.indicatorPlace === 'left',
  'cus-carousel__indicators--right': isVertical.value && (!props.indicatorPlace || props.indicatorPlace === 'right'),
  'is-card': isCardMode.value,
  'cus-carousel__indicators--outside': props.indicatorPosition === 'outside',
  'cus-carousel__indicators--labels': hasLabel.value,
}));

// --- METHODS ---
const addItem = (item: CarouselItem) => {
  items.value.push(item);
};
const removeItem = (uid: string | number | symbol) => {
  const index = items.value.findIndex(item => item.uid === uid);
  if (index !== -1) items.value.splice(index, 1);
};

const setActiveItem = (target: number | string | symbol) => {
  const oldIndex = activeIndex.value;
  let index = -1
  if (typeof target === 'string' || typeof target === 'symbol') {
    index = items.value.findIndex(item => item.props.name === target);
  }
  if (typeof target === 'number') {
    index = target;
  }
  const len = items.value.length;
  if (len === 0 || index < -1) { activeIndex.value = -1; return; }
  if (props.loop) { index = (index + len) % len; }
  else { index = Math.max(0, Math.min(index, len - 1)); }
  if (index === activeIndex.value) return;
  activeIndex.value = index;
  emit('change', index, oldIndex);
};

const prev = () => setActiveItem(activeIndex.value - 1);
const next = () => setActiveItem(activeIndex.value + 1);

const playSlides = () => {
  if (activeIndex.value < items.value.length - 1) { next(); }
  else if (props.loop) { setActiveItem(0); }
};
const startTimer = () => {
  if (props.interval <= 0 || !props.autoplay) return;
  timer = setInterval(playSlides, props.interval);
};
const pauseTimer = () => {
  clearInterval(timer);
  timer = undefined;
};
const resetTimer = () => {
  pauseTimer();
  startTimer();
};

const handleMouseEnter = () => {
  isHovering.value = true;
  if (props.pauseOnHover) pauseTimer();
};
const handleMouseLeave = () => {
  isHovering.value = false;
  resetTimer();
};
const handleIndicatorClick = (index: number) => {
  setActiveItem(index);
};
const throttledIndicatorHover = (index: number) => {
  if (props.trigger === 'hover') setActiveItem(index);
};
const throttledArrowClick = (index: number) => {
  setActiveItem(index);
};

// --- LIFECYCLE & WATCHERS ---
onMounted(() => {
  setActiveItem(props.initialIndex);
  startTimer();
});
onBeforeUnmount(() => {
  pauseTimer();
});

watch(
  () => activeIndex.value,
  () => resetTimer()
);
watch(
  () => props.autoplay,
  (val) => val ? startTimer() : pauseTimer()
);
watch(
  [() => props.loop, () => items.value.length],
  () => setActiveItem(activeIndex.value)
);

// --- PROVIDE ---
provide('carouselContext', {
  root,
  isCardMode,
  isVertical,
  loop: props.loop,
  items,
  activeIndex,
  cardScale: props.cardScale,
  addItem,
  removeItem,
  setActiveItem
});

defineExpose({
  prev,
  next,
  setActiveItem,
  activeIndex
});
</script>

<style lang="scss" scoped>
/* Base */
.cus-carousel {
  position: relative;

  &:focus-visible {
    outline: none;
  }
}

.cus-carousel__container {
  position: relative;
  overflow: hidden;
}

/* Arrows */
.cus-carousel__arrow {
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  height: 36px;
  width: 36px;
  cursor: pointer;
  transition: .3s;
  border-radius: 50%;
  background-color: rgba(31, 45, 61, .5);
  color: #fff;
  position: absolute;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
  text-align: center;
  font-size: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: rgba(31, 45, 61, .7);
  }
}

.cus-carousel__arrow svg {
  height: 1.5em;
  width: 1.5em;
  fill: currentColor;
}

.cus-carousel__arrow--left {
  left: 16px;
}

.cus-carousel__arrow--right {
  right: 16px;
}

.carousel-arrow-left-enter-from,
.carousel-arrow-left-leave-active {
  transform: translateY(-50%) translateX(-10px);
  opacity: 0;
}

.carousel-arrow-right-enter-from,
.carousel-arrow-right-leave-active {
  transform: translateY(-50%) translateX(10px);
  opacity: 0;
}

/* Card Mode */
.cus-carousel--card {
  overflow: hidden;
}

.cus-carousel--card .cus-carousel__container {
  overflow: hidden;
}

/* Indicators */
.cus-carousel__indicators {
  position: absolute;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 2;
  line-height: 1.7;

  &.is-card .cus-carousel__button {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: v-bind(indicatorNormalColor);
    opacity: 1;
  }

  &.is-card .cus-carousel__indicator.is-active .cus-carousel__button {
    background-color: v-bind(indicatorActiveColor);
  }
}

.cus-carousel__indicators--horizontal {
  left: 50%;
  transform: translateX(-50%);

  & .cus-carousel__indicator {
    padding: 12px 4px;
  }
}

.cus-carousel__indicators--vertical {
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;

  & .cus-carousel__indicator {
    padding: 4px 12px;
  }

  & .cus-carousel__button {
    width: 2px;
    height: 15px;
  }
}

.cus-carousel__indicators--left {
  left: 0;
}

.cus-carousel__indicators--right {
  right: 0;
}

.cus-carousel__indicators--top {
  top: 0;
}

.cus-carousel__indicators--bottom {
  bottom: 0;
}

.cus-carousel__indicators--outside {
  position: static;
  transform: none;
  text-align: center;
}

.cus-carousel__indicator {
  flex: 1;
  display: inline-block;
  background-color: transparent;
  cursor: pointer;

  &:hover .cus-carousel__button {
    opacity: 0.72;
  }

  &.is-active .cus-carousel__button {
    opacity: 1;
    background-color: v-bind(indicatorActiveColor);
  }
}

.cus-carousel__button {
  display: block;
  opacity: .48;
  width: 30px;
  height: 2px;
  background-color: v-bind(indicatorNormalColor);
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  transition: .3s;
}
</style>
