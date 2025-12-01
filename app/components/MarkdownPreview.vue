<script setup lang="ts">
import { marked } from "marked";

const props = defineProps<{
  content: string;
}>();

// 配置 marked
marked.setOptions({
  breaks: true, // 将换行转换为 <br>
  gfm: true, // 启用 GitHub 风格的 Markdown
});

// 渲染 Markdown
const renderedContent = computed(() => {
  if (!props.content) return "";
  return marked(props.content);
});
</script>

<template>
  <div
    class="markdown-preview prose prose-gray dark:prose-invert max-w-none"
    v-html="renderedContent"
  ></div>
</template>

<style lang="scss">
.markdown-preview {
  // 基础样式
  font-size: 1rem;
  line-height: 1.75;
  color: inherit;

  // 标题
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.875rem;
  }
  h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid rgb(229, 231, 235);
    padding-bottom: 0.5rem;
  }
  h3 {
    font-size: 1.25rem;
  }
  h4 {
    font-size: 1.125rem;
  }

  // 段落
  p {
    margin: 1rem 0;
  }

  // 链接
  a {
    color: rgb(59, 130, 246);
    text-decoration: underline;
    &:hover {
      color: rgb(37, 99, 235);
    }
  }

  // 代码
  code {
    background-color: rgb(243, 244, 246);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: ui-monospace, monospace;
    color: rgb(236, 72, 153);
  }

  pre {
    background-color: rgb(243, 244, 246);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;

    code {
      background-color: transparent;
      padding: 0;
      color: rgb(31, 41, 55);
    }
  }

  // 列表
  ul,
  ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    margin: 0.25rem 0;
  }

  // 引用
  blockquote {
    border-left: 4px solid rgb(209, 213, 219);
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: rgb(107, 114, 128);
  }

  // 分隔线
  hr {
    margin: 2rem 0;
    border-color: rgb(229, 231, 235);
  }

  // 图片
  img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }

  // 表格
  table {
    width: 100%;
    margin: 1rem 0;
    border-collapse: collapse;

    th,
    td {
      border: 1px solid rgb(229, 231, 235);
      padding: 0.5rem 1rem;
      text-align: left;
    }

    th {
      background-color: rgb(243, 244, 246);
      font-weight: 500;
    }

    tr:nth-child(even) {
      background-color: rgb(249, 250, 251);
    }
  }

  // 任务列表
  input[type="checkbox"] {
    margin-right: 0.5rem;
  }
}

// 暗色模式
.dark .markdown-preview {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: white;
  }

  h2 {
    border-bottom-color: rgb(55, 65, 81);
  }

  p {
    color: rgb(209, 213, 219);
  }

  a {
    color: rgb(96, 165, 250);
    &:hover {
      color: rgb(147, 197, 253);
    }
  }

  code {
    background-color: rgb(31, 41, 55);
    color: rgb(244, 114, 182);
  }

  pre {
    background-color: rgb(31, 41, 55);

    code {
      color: rgb(229, 231, 235);
    }
  }

  ul,
  ol {
    color: rgb(209, 213, 219);
  }

  blockquote {
    border-left-color: rgb(75, 85, 99);
    color: rgb(156, 163, 175);
  }

  hr {
    border-color: rgb(55, 65, 81);
  }

  table {
    th,
    td {
      border-color: rgb(55, 65, 81);
    }

    th {
      background-color: rgb(31, 41, 55);
    }

    tr:nth-child(even) {
      background-color: rgba(31, 41, 55, 0.5);
    }
  }
}
</style>
