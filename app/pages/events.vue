<script setup lang="ts">
import type { Event } from "~/types/database.types";

// SEO 元数据
useSeoMeta({
  title: "时间线",
});

// 从 API 获取事件列表
const { data: eventsResponse } = await useFetch("/api/events");

// 提取事件数据
const events = computed(() => (eventsResponse.value?.data || []) as Event[]);

// 所有标签列表
const allTags = computed(() => {
  const tags = new Set<string>();
  events.value.forEach((e) => e.tags?.forEach((tag) => tags.add(tag)));
  return Array.from(tags);
});

// 当前选中的标签
const selectedTag = ref("");

// 过滤后的事件
const filteredEvents = computed(() => {
  if (selectedTag.value === "") return events.value;
  return events.value.filter((e) => e.tags?.includes(selectedTag.value));
});

// 按年份分组
const groupedEvents = computed(() => {
  const groups: Record<string, Event[]> = {};

  filteredEvents.value.forEach((event) => {
    const year = new Date(event.event_date).getFullYear().toString();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(event);
  });
  // 按年份降序排序
  const sortedGroups: Record<string, Event[]> = {};
  Object.keys(groups)
    .sort((a, b) => Number(b) - Number(a))
    .forEach((year) => {
      // 每年内按日期降序排序
      const yearEvents = groups[year];
      if (yearEvents) {
        sortedGroups[year] = yearEvents.sort(
          (a, b) =>
            new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        );
      }
    });

  return sortedGroups;
});

// 格式化事件日期
const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};
</script>

<template>
  <Layout :mode="1">
    <!-- 标签过滤 -->
    <div v-if="allTags.length > 0" class="flex gap-2 mb-8 flex-wrap">
      <button
        @click="selectedTag = ''"
        class="px-4 py-2 rounded-full text-caption transition-all duration-300"
        :class="
          selectedTag === ''
            ? 'bg-accent text-white'
            : 'bg-theme-bg-mute text-theme-text-soft hover:bg-theme-hover'
        "
      >
        全部
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        @click="selectedTag = tag"
        class="px-4 py-2 rounded-full text-caption transition-all duration-300"
        :class="
          selectedTag === tag
            ? 'bg-accent text-white'
            : 'bg-theme-bg-mute text-theme-text-soft hover:bg-theme-hover'
        "
      >
        {{ tag }}
      </button>
    </div>

    <!-- 时间线 -->
    <div v-if="filteredEvents.length > 0" class="relative">
      <!-- 时间线轴 -->
      <div
        class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-theme-divider transform md:-translate-x-1/2"
      ></div>

      <!-- 按年份分组 -->
      <div
        v-for="(yearEvents, year) in groupedEvents"
        :key="year"
        class="mb-12"
      >
        <!-- 年份标题 -->
        <div class="relative flex items-center mb-8">
          <h2
            class="ml-12 md:ml-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full card-title mb-0"
          >
            {{ year }}
          </h2>
        </div>

        <!-- 事件列表 -->
        <div class="space-y-8">
          <div
            v-for="(event, index) in yearEvents"
            :key="event.id"
            class="relative flex items-start"
            :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
          >
            <!-- 时间点 -->
            <div
              class="absolute left-4 md:left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 md:-translate-x-1/2 z-10 mt-2"
              :style="{ backgroundColor: event.color || '#3B82F6' }"
            ></div>

            <!-- 事件卡片 -->
            <div
              class="glass-card ml-12 md:ml-0 md:w-[calc(50%-2rem)] transition-all duration-300"
              :class="
                index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
              "
            >
              <!-- 日期 -->
              <div class="text-caption mb-2">
                {{ formatEventDate(event.event_date) }}
              </div>
              <!-- 标题 -->
              <h3 class="card-title mb-2">
                {{ event.title }}
              </h3>

              <!-- 描述 - 使用 Markdown 渲染 -->
              <div v-if="event.description" class="text-body text-sm">
                <MarkdownPreview :content="event.description" />
              </div>

              <!-- 标签 -->
              <div
                v-if="event.tags && event.tags.length > 0"
                class="flex gap-2 mt-3 flex-wrap"
              >
                <span
                  v-for="tag in event.tags"
                  :key="tag"
                  class="px-3 py-1 text-tiny rounded-full"
                  :style="{
                    backgroundColor: (event.color || '#3B82F6') + '20',
                    color: event.color || '#3B82F6',
                  }"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 无内容时的提示 -->
    <div v-else class="text-center py-20">
      <div class="text-6xl mb-6">📅</div>
      <p class="text-body text-theme-text-mute">
        暂无事件记录，敬请期待...
      </p>
    </div>
  </Layout>
</template>
