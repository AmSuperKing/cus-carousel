# cus-carousel

走马灯组件，参照[ElementPlus el-carousel](https://element-plus.org/zh-CN/component/carousel.html) 组件效果实现，针对想要该效果但又不想使用ElementPlus UI库的开发人员实现

### 安装

```sh
npm install cus-carousel
# or
yarn add cus-carousel
# or
pnpm add cus-carousel
```

### 使用

`templateUse.vue`

```vue
<template>
  <CusCarousel type="card" :interval="3000" height="300px" arrow="hover">
     <CusCarouselItem v-for="(img, idx) of imageList" :key="idx">
       <img :src="img" :alt="`img-${idx}`" style="width: 100%;height: 100%;">
     </CusCarouselItem>
  </CusCarousel>
</template>

<script lang="ts" setup>
import{ CusCarousel, CusCarouselItem } from 'cus-carousel'

const imageList = [
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
  'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
  'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
  'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
  'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
  'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
  'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg',
]
</script>
```

### 组件Carousel Props配置

| 属性名               | 说明                                  | 类型                                         | 默认值       |
| -------------------- | ------------------------------------- | -------------------------------------------- | ------------ |
| height               | carousel 的高度                       | string                                       | '300px'      |
| initialIndex         | 初始状态激活的幻灯片的索引，从 0 开始 | number                                       | 0            |
| trigger              | 指示器的触发方式                      | 'click'\|'hover'                             | 'hover'      |
| autoplay             | 是否自动切换                          | boolean                                      | true         |
| interval             | 自动切换的时间间隔，单位为毫秒        | number                                       | 3000         |
| indicatorPosition    | 指示器的内外位置                      | '' \| 'outside' \| 'none'                    | ''           |
| indicatorPlace       | 指示器的排放位置                      | ''\|'left'\|'right'\|'top'\|'bottom'\|'none' | ''           |
| indicatorNormalColor | 默认指示器的颜色                      | string                                       | '#c0c4cc'    |
| indicatorActiveColor | 当前激活的默认指示器的颜色            | string                                       | '#409eff'    |
| arrow                | 切换箭头的显示时机                    | 'always' \| 'never' \| 'hover'               | 'hover'      |
| type                 | carousel 的类型                       | '' \| 'card'                                 | ''           |
| cardScale            | 当 type 为 card 时，二级卡的缩放大小  | number                                       | 0.83         |
| loop                 | 是否循环显示                          | boolean                                      | true         |
| direction            | 展示的方向                            | 'horizontal' \| 'vertical'                   | 'horizontal' |
| pauseOnHover         | 鼠标悬浮时暂停自动切换                | boolean                                      | true         |

### 组件Carousel slot

| slot                                                         | 说明               |
| ------------------------------------------------------------ | ------------------ |
| `<slot name="arrows" :arrowDisplay="arrowDisplay" :isHovering="isHovering" :prev="prev" :next="next"></slot>` | 自定义左右切换按钮 |
| `<slot></slot>`                                              | 默认插槽           |
| `<slot name="indicators" :items="items" :activeIndex="activeIndex" :setActiveItem="setActiveItem"></slot>` | 自定义指示器插槽   |

### 组件Carousel Event

| **事件名** | **说明**                                                     | **类型** |
| ---------- | ------------------------------------------------------------ | -------- |
| change     | 当前展示的幻灯片切换时触发，它有两个参数， 一个是新幻灯片的索引，另一个是旧幻灯片的索引 | Function |

### 组件Carousel Exposes

| 名称          | 说明                                                         | 类型       |
| ------------- | ------------------------------------------------------------ | ---------- |
| activeIndex   | 当前幻灯片的索引                                             | number     |
| setActiveItem | 手动切换幻灯片，传入需要切换的幻灯片的索引，从 0 开始；或相应 `el-carousel-item` 的 `name` 属性值 | `Function` |
| prev          | 切换至上一张幻灯片                                           | Function   |
| next          | 切换至下一张幻灯片                                           | Function   |



### 组件CarouselItem Props配置

| 属性名 | 说明                                        | 类型   | 默认值 |
| ------ | ------------------------------------------- | ------ | ------ |
| label  | 幻灯片的名字，可用作 `setActiveItem` 的参数 | string | ''     |
| name   | 该幻灯片所对应指示器的文本                  | string | ''     |

### 组件CarouselItem slot

| slot            | 说明     |
| --------------- | -------- |
| `<slot></slot>` | 默认内容 |

### 源代码

[Github](https://github.com/AmSuperKing/cus-carousel)

[Gitee](https://gitee.com/amsuperking/cus-carousel)
