<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Copy, Mail, MessagesSquare, Plus, X } from "lucide-vue-next";
import { CONTEST } from "@/lib/contest";
import { http } from "@/api/http";
import { useAppStore } from "@/stores/app";
import { cn } from "@/utils/cn";

interface DraftAttachment {
  id: string;
  name: string;
  url: string;
}

const MAX_IMAGES = 4;
const MAX_BYTES = 5 * 1024 * 1024;

const store = useAppStore();
const open = ref(false);
const content = ref("");
const contact = ref("");
const attachments = ref<DraftAttachment[]>([]);
const error = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const mail = `mailto:${CONTEST.supportEmail}?subject=${encodeURIComponent(`[${CONTEST.name}] 问题反馈`)}`;

watch(open, (v) => {
  if (!v) return;
  error.value = "";
  content.value = "";
  contact.value = store.currentUser?.email || store.currentUser?.phone || "";
  attachments.value = [];
  if (fileInput.value) fileInput.value.value = "";
});

const copied = ref(false);
let copiedTimer: number | undefined;

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONTEST.supportEmail);
    copied.value = true;
    if (copiedTimer) window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      copied.value = false;
    }, 1600);
    ElMessage.success("邮箱已复制");
  } catch {
    ElMessage.error("复制失败，请手动复制");
  }
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("读取失败"));
    reader.readAsDataURL(file);
  });
}

async function addFiles(fileList: FileList | File[]) {
  const incoming = Array.from(fileList);
  const room = MAX_IMAGES - attachments.value.length;
  if (room <= 0) {
    ElMessage.warning(`最多上传 ${MAX_IMAGES} 张图片`);
    return;
  }
  const picked = incoming.slice(0, room);
  if (incoming.length > room) {
    ElMessage.warning(`最多上传 ${MAX_IMAGES} 张，已忽略多余文件`);
  }
  for (const file of picked) {
    if (!file.type.startsWith("image/")) {
      ElMessage.error(`「${file.name}」不是图片，请上传截图`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      ElMessage.error(`「${file.name}」超过 5MB，请压缩后重试`);
      continue;
    }
    try {
      const url = await readFile(file);
      attachments.value = [
        ...attachments.value,
        { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name: file.name, url },
      ];
    } catch {
      ElMessage.error(`「${file.name}」读取失败`);
    }
  }
}

function onPick(ev: Event) {
  const input = ev.target as HTMLInputElement;
  if (input.files?.length) void addFiles(input.files);
  input.value = "";
}

function removeAttachment(id: string) {
  attachments.value = attachments.value.filter((item) => item.id !== id);
}

async function onSubmit() {
  try {
    await http.post("/messages", {
      content: content.value,
      contact: contact.value,
      attachments: attachments.value.map(({ name, url }) => ({ name, url })),
      attachmentName: attachments.value[0]?.name ?? "",
      attachmentUrl: attachments.value[0]?.url ?? "",
    });
    open.value = false;
    ElMessage.success("留言已提交，组委会将尽快回复。");
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } }; message?: string };
    error.value = err.response?.data?.error || err.message || "提交失败";
  }
}
</script>

<template>
  <div class="feedback-dock">
    <div class="feedback-rail">
      <div class="feedback-mail">
        <div class="feedback-pop">
          <p class="text-[13px] text-neutral-600">联系邮箱</p>
          <div class="mt-1 flex items-center gap-1.5">
            <span class="text-[14px] leading-5 font-medium whitespace-nowrap text-neutral-900">{{ CONTEST.supportEmail }}</span>
            <button
              type="button"
              :class="
                cn(
                  'inline-flex shrink-0 rounded p-0.5 transition-colors',
                  copied ? 'text-blue-600' : 'text-neutral-900',
                )
              "
              :aria-label="copied ? '已复制' : '复制邮箱'"
              title="复制邮箱"
              @click="copyEmail"
            >
              <Copy class="size-4" :stroke-width="copied ? 2.4 : 2" />
            </button>
          </div>
          <span class="feedback-pop-caret" />
        </div>
        <a :href="mail" class="feedback-item" aria-label="联系邮箱">
          <Mail class="size-5" :stroke-width="1.6" />
          <span>邮箱</span>
        </a>
      </div>
      <button type="button" class="feedback-item" aria-label="留言" @click="open = true">
        <MessagesSquare class="size-5" :stroke-width="1.6" />
        <span>留言</span>
      </button>
    </div>

    <el-dialog
      v-model="open"
      title="留言"
      width="560px"
      align-center
      class="feedback-sheet"
      append-to-body
    >
      <p class="feedback-sheet-hint">请简要描述您遇到的问题，组委会会尽快处理。</p>
      <el-form class="feedback-sheet-form" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="问题描述">
          <el-input
            v-model="content"
            type="textarea"
            :rows="7"
            resize="none"
            placeholder="例如：报名表无法提交、盖章件上传失败、个人中心看不到进度……"
          />
          <p v-if="error" class="mt-1 text-xs text-rose-500">{{ error }}</p>
        </el-form-item>

        <el-form-item>
          <template #label>
            <span class="feedback-attach-label">
              截图/附件
              <em>（选填，最多 4 张，单张 ≤ 5MB）</em>
            </span>
          </template>
          <div class="feedback-attach-row">
            <div v-for="item in attachments" :key="item.id" class="feedback-thumb">
              <img :src="item.url" :alt="item.name" />
              <button type="button" class="feedback-thumb-remove" aria-label="移除图片" @click="removeAttachment(item.id)">
                <X class="size-3.5" :stroke-width="2.4" />
              </button>
            </div>
            <button
              v-if="attachments.length < MAX_IMAGES"
              type="button"
              class="feedback-add-tile"
              @click="fileInput?.click()"
            >
              <Plus class="size-5" :stroke-width="1.8" />
              <span>添加图片</span>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onPick"
            />
          </div>
        </el-form-item>

        <el-form-item label="联系方式（选填）">
          <el-input v-model="contact" placeholder="手机号或邮箱，方便我们回复您" />
        </el-form-item>

        <div class="flex justify-end gap-2 pt-1">
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">提交留言</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
