<script setup lang="ts">
import bilibiliIcon from "~/assets/svg/bilibili.svg";
import githubIcon from "~/assets/svg/github.svg";
import emailIcon from "~/assets/svg/email.svg";
import qqIcon from "~/assets/svg/qq.svg";

const themeStore = useThemeStore();
const { isDarkTheme } = storeToRefs(themeStore);

// SEO 元数据 - 首页只显示 YuBubbles
useSeoMeta({
  title: "YuBubbles",
  titleTemplate: "",
});

// ==================== Page Control ====================
let timeout_event: ReturnType<typeof setTimeout> | null = null;
const current = ref(1);

const nextPage = (num: number): void => {
  if (timeout_event) return;
  current.value += num;
  timeout_event = setTimeout(() => {
    timeout_event = null;
  }, 1000);
};

const handleScroll = (event: WheelEvent): void => {
  const deltaY = event.deltaY;
  if (deltaY > 0 && current.value < 3) {
    nextPage(1);
  } else if (deltaY < 0 && current.value > 1) {
    nextPage(-1);
  }
};

// ==================== Page One: Canvas Animation ====================
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { initCanvas } = useAnimate(canvasRef, isDarkTheme);
let cleanupCanvas: (() => void) | null = null;

// ==================== Page One: Typewriter Effect ====================
const texts = [
  "keep coding...",
  'print("Hello World")',
  'console.log("Hello World")',
  'System.out.println("Hello World");',
  'fmt.Println("Hello World")',
  'echo "Hello World"',
];

const currentText = ref("");
const currentIndex = ref(0);
const isDeleting = ref(false);
const typingSpeed = ref(100);

const typeWriter = () => {
  const fullText = texts[currentIndex.value] || "";

  if (isDeleting.value) {
    currentText.value = fullText.substring(0, currentText.value.length - 1);
    typingSpeed.value = 50;
  } else {
    currentText.value = fullText.substring(0, currentText.value.length + 1);
    typingSpeed.value = 100;
  }

  if (!isDeleting.value && currentText.value === fullText) {
    typingSpeed.value = 2500;
    isDeleting.value = true;
  } else if (isDeleting.value && currentText.value === "") {
    isDeleting.value = false;
    currentIndex.value = (currentIndex.value + 1) % texts.length;
    typingSpeed.value = 500;
  }

  setTimeout(typeWriter, typingSpeed.value);
};

// ==================== Page Three: Social Links ====================
const socialLinks = [
  {
    name: "Bilibili",
    icon: bilibiliIcon,
    url: "",
    enabled: true,
  },
  {
    name: "GitHub",
    icon: githubIcon,
    url: "",
    enabled: true,
  },
  {
    name: "Email",
    icon: emailIcon,
    url: "mailto:tohoooosi@outlook.com",
    enabled: true,
  },
  { name: "QQ", icon: qqIcon, url: "", enabled: false },
];

// ==================== Lifecycle ====================
onMounted(() => {
  window.addEventListener("wheel", handleScroll);
  setTimeout(typeWriter, 1000);
  cleanupCanvas = initCanvas() || null;
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", handleScroll);
  if (cleanupCanvas) {
    cleanupCanvas();
  }
});

await new Promise((resolve) => setTimeout(resolve, 0));
</script>

<template>
  <Layout>
    <div class="relative overflow-hidden h-svh w-svw bg-theme-bg-soft">
      <!-- Page One -->
      <PageSection v-model="current" :index="1">
        <div
          class="absolute inset-0 transition-colors duration-500 bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-[#0a0a0f] dark:to-[#0f172a]"
        ></div>
        <canvas ref="canvasRef" class="absolute inset-0"></canvas>
        <div
          class="relative flex flex-col w-full h-full justify-center items-center"
        >
          <div class="z-10 flex flex-col items-start max-w-2xl px-8">
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-theme-text mb-4 whitespace-nowrap">Hi, I'm <span class="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-pink-500">Yuzi</span> 👋</h1>
            <p class="text-xl md:text-2xl mb-8 italic text-theme-text-soft">
              大三在读，目标成为一名全栈工程师。<br />
              热爱技术，相信开源的力量。
            </p>
            <div class="flex items-center gap-2 text-mono md:text-base">
              <span class="text-green-600 dark:text-green-400">$</span>
              <span class="text-theme-text-soft">
                {{ currentText }}
              </span>
              <span class="typing-cursor text-green-600 dark:text-green-400"
                >▋</span
              >
            </div>
          </div>
          <div
            class="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <svg
              class="w-5 h-5 transition-colors duration-300 text-theme-text-mute"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </PageSection>
      <!-- Page Two -->
      <PageSection v-model="current" :index="2">
        <!-- 渐变背景 -->
        <div
          class="absolute inset-0 transition-colors duration-500 bg-linear-to-br from-rose-100 via-fuchsia-100 to-indigo-200 dark:from-[#1a1033] dark:via-[#0f172a] dark:to-[#1e1b4b]"
        ></div>

        <div class="relative flex w-full h-full items-center justify-center">
          <div class="text-center z-10 px-8">
            <h2 class="page-title text-4xl md:text-5xl mb-6">探索更多</h2>
            <p class="text-body text-theme-text-mute max-w-md mx-auto">
              在这里分享技术文章、生活随笔、以及一些有趣的想法
            </p>
          </div>
        </div>
      </PageSection>
      <!-- Page Three -->
      <PageSection v-model="current" :index="3">
        <!-- 渐变背景 - 暗色模式使用深色确保与白色图标对比 -->
        <div
          class="absolute inset-0 transition-colors duration-500 bg-linear-to-tl from-cyan-100 via-sky-100 to-indigo-200 dark:from-[#0c1222] dark:via-[#0a0a14] dark:to-[#1a1035]"
        ></div>

        <div class="relative flex flex-col w-full h-full">
          <div class="z-10 m-auto flex flex-col justify-center items-center">
            <h2
              class="section-title text-3xl md:text-4xl font-light mb-2 tracking-widest"
            >
              联系方式
            </h2>
            <p class="text-caption mb-12">CONTACT</p>
            <div class="flex gap-8 mb-12">
              <a
                v-for="link in socialLinks"
                :key="link.name"
                :href="link.url"
                target="_blank"
                class="group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gray-900 dark:bg-white/5 backdrop-blur-md border border-gray-800 dark:border-white/10 shadow-sm dark:shadow-none hover:bg-gray-800 dark:hover:bg-white/10"
                :class="{
                  'cursor-not-allowed opacity-50 grayscale': !link.enabled,
                }"
              >
                <span
                  class="absolute -top-10 scale-0 group-hover:scale-100 transition-transform duration-300 px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl whitespace-nowrap"
                >
                  {{ link.name }}
                </span>
                <img
                  :src="link.icon"
                  :alt="link.name"
                  class="w-8 h-8 transition-transform duration-300 group-hover:scale-110 opacity-90 dark:opacity-90 group-hover:opacity-100"
                />
              </a>
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
// Page One
.typing-cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
