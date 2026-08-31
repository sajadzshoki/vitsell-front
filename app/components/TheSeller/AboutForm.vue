<template>
  <div class="space-y-5">
    <div
      v-if="!ready"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <template v-else>
      <!-- Header / hero -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h2 class="font-bold text-highlighted mb-1">
          {{ $t('هیرو و معرفی') }}
        </h2>
        <p class="text-xs text-muted mb-4 leading-6">
          {{ $t('عنوان صفحه، زیرعنوان و تصویر هیرو را تنظیم کنید.') }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="form.eyebrow"
            :label="$t('برچسب کوچک')"
            icon="i-tabler-tag"
          />
          <TheFormInput
            v-model="form.title"
            :label="$t('عنوان')"
            required
            :error="errors.title"
            icon="i-tabler-heading"
          />
          <UFormField
            class="md:col-span-2"
            :label="$t('زیرعنوان')"
            required
            :error="errors.subtitle"
          >
            <UTextarea
              v-model="form.subtitle"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <div class="md:col-span-2">
            <TheSellerImageUpload
              v-model="form.heroImage"
              :label="$t('تصویر هیرو')"
              icon="i-tabler-photo"
              :alt="form.title || $t('هیرو درباره ما')"
              :error="errors.heroImage"
              :hint="$t('تصویر را از دستگاه انتخاب یا رها کنید')"
              @error="form.heroImage = ''"
            />
          </div>
        </div>
      </div>

      <!-- Story -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h2 class="font-bold text-highlighted mb-4">
          {{ $t('داستان و ماموریت') }}
        </h2>
        <div class="space-y-4">
          <TheFormInput
            v-model="form.storyTitle"
            :label="$t('عنوان داستان')"
          />
          <UFormField
            :label="$t('متن داستان')"
            :help="$t('هر پاراگراف را با یک خط خالی جدا کنید')"
            :error="errors.storyText"
            required
          >
            <UTextarea
              v-model="form.storyText"
              :rows="8"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TheFormInput
              v-model="form.missionTitle"
              :label="$t('عنوان ماموریت')"
            />
            <TheFormInput
              v-model="form.visionTitle"
              :label="$t('عنوان چشم‌انداز')"
            />
            <UFormField
              :label="$t('ماموریت')"
              required
              :error="errors.mission"
            >
              <UTextarea
                v-model="form.mission"
                :rows="3"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="$t('چشم‌انداز')"
              required
              :error="errors.vision"
            >
              <UTextarea
                v-model="form.vision"
                :rows="3"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('آمارها') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="form.stats.push(emptyAboutStat())"
          >
            {{ $t('افزودن آمار') }}
          </UButton>
        </div>
        <div
          v-for="(stat, index) in form.stats"
          :key="stat.id"
          class="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-xl border border-muted bg-muted/30"
        >
          <TheFormInput
            v-model="stat.icon"
            :label="$t('آیکون')"
            placeholder="i-tabler-..."
            dir="ltr"
          />
          <TheFormInput
            v-model="stat.value"
            :label="$t('مقدار')"
          />
          <TheFormInput
            v-model="stat.label"
            :label="$t('برچسب')"
          />
          <div class="flex items-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              class="cursor-pointer"
              :disabled="form.stats.length <= 1"
              @click="form.stats.splice(index, 1)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Values -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('ارزش‌ها') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="form.values.push(emptyAboutValue())"
          >
            {{ $t('افزودن ارزش') }}
          </UButton>
        </div>
        <div
          v-for="(item, index) in form.values"
          :key="item.id"
          class="space-y-3 p-3 rounded-xl border border-muted bg-muted/30"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="item.icon"
              :label="$t('آیکون')"
              placeholder="i-tabler-..."
              dir="ltr"
            />
            <TheFormInput
              v-model="item.title"
              :label="$t('عنوان')"
            />
          </div>
          <UFormField :label="$t('توضیح')">
            <UTextarea
              v-model="item.description"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            class="cursor-pointer"
            :disabled="form.values.length <= 1"
            @click="form.values.splice(index, 1)"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </div>

      <!-- Milestones -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="font-bold text-highlighted">
            {{ $t('مسیر رشد') }}
          </h2>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="form.milestones.push(emptyAboutMilestone())"
          >
            {{ $t('افزودن مرحله') }}
          </UButton>
        </div>
        <div
          v-for="(item, index) in form.milestones"
          :key="item.id"
          class="space-y-3 p-3 rounded-xl border border-muted bg-muted/30"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="item.year"
              :label="$t('سال')"
            />
            <TheFormInput
              v-model="item.title"
              :label="$t('عنوان')"
            />
          </div>
          <UFormField :label="$t('توضیح')">
            <UTextarea
              v-model="item.description"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            class="cursor-pointer"
            :disabled="form.milestones.length <= 1"
            @click="form.milestones.splice(index, 1)"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </div>

      <!-- Team -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 class="font-bold text-highlighted">
              {{ $t('تیم') }}
            </h2>
            <p class="text-xs text-muted mt-1">
              {{ $t('اعضای تیم صفحه درباره ما') }}
            </p>
          </div>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="form.team.push(emptyAboutTeamMember())"
          >
            {{ $t('افزودن عضو') }}
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TheFormInput
            v-model="form.teamTitle"
            :label="$t('عنوان بخش تیم')"
          />
          <TheFormInput
            v-model="form.teamSubtitle"
            :label="$t('زیرعنوان تیم')"
          />
        </div>
        <div
          v-for="(member, index) in form.team"
          :key="member.id"
          class="space-y-3 p-3 rounded-xl border border-muted bg-muted/30"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="member.name"
              :label="$t('نام')"
            />
            <TheFormInput
              v-model="member.role"
              :label="$t('سمت')"
            />
          </div>
          <UFormField :label="$t('بیوگرافی کوتاه')">
            <UTextarea
              v-model="member.bio"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <TheSellerImageUpload
            v-model="member.image"
            :label="$t('تصویر')"
            :alt="member.name || $t('عضو تیم')"
            @error="member.image = ''"
          />
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            class="cursor-pointer"
            :disabled="form.team.length <= 1"
            @click="form.team.splice(index, 1)"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </div>

      <!-- CTA -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h2 class="font-bold text-highlighted mb-4">
          {{ $t('فراخوان اقدام (CTA)') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="form.cta.title"
            class="md:col-span-2"
            :label="$t('عنوان')"
          />
          <UFormField
            class="md:col-span-2"
            :label="$t('زیرعنوان')"
          >
            <UTextarea
              v-model="form.cta.subtitle"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <TheFormInput
            v-model="form.cta.primaryLabel"
            :label="$t('متن دکمه اصلی')"
          />
          <TheFormInput
            v-model="form.cta.primaryTo"
            :label="$t('لینک دکمه اصلی')"
            dir="ltr"
          />
          <TheFormInput
            v-model="form.cta.secondaryLabel"
            :label="$t('متن دکمه فرعی')"
          />
          <TheFormInput
            v-model="form.cta.secondaryTo"
            :label="$t('لینک دکمه فرعی')"
            dir="ltr"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap pb-2">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
          @click="onReset"
        >
          {{ $t('بازگشت به پیش‌فرض') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="lg"
          to="/about"
          target="_blank"
        >
          {{ $t('مشاهده صفحه') }}
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  cloneAboutPage,
  emptyAboutMilestone,
  emptyAboutStat,
  emptyAboutTeamMember,
  emptyAboutValue,
  type AboutPagePayload,
} from '~/data/about'

type AboutFormState = {
  title: string
  subtitle: string
  eyebrow: string
  heroImage: string
  storyTitle: string
  storyText: string
  missionTitle: string
  mission: string
  visionTitle: string
  vision: string
  stats: AboutPagePayload['stats']
  values: AboutPagePayload['values']
  milestones: AboutPagePayload['milestones']
  teamTitle: string
  teamSubtitle: string
  team: AboutPagePayload['team']
  cta: AboutPagePayload['cta']
}

const { t } = useI18n()
const toast = useAppToast()
const { about, ensureSeeded, updateAbout, resetToDefaults } = useAbout()

const ready = ref(false)
const saving = ref(false)
const form = ref<AboutFormState>(payloadToForm(buildInitial()))
const errors = ref<Partial<Record<'title' | 'subtitle' | 'heroImage' | 'storyText' | 'mission' | 'vision', string>>>({})

function buildInitial() {
  return cloneAboutPage(about.value)
}

function payloadToForm(payload: AboutPagePayload): AboutFormState {
  return {
    title: payload.title,
    subtitle: payload.subtitle,
    eyebrow: payload.eyebrow,
    heroImage: payload.heroImage,
    storyTitle: payload.storyTitle,
    storyText: payload.story.join('\n\n'),
    missionTitle: payload.missionTitle,
    mission: payload.mission,
    visionTitle: payload.visionTitle,
    vision: payload.vision,
    stats: cloneAboutPage(payload).stats,
    values: cloneAboutPage(payload).values,
    milestones: cloneAboutPage(payload).milestones,
    teamTitle: payload.teamTitle,
    teamSubtitle: payload.teamSubtitle,
    team: cloneAboutPage(payload).team,
    cta: cloneAboutPage(payload).cta,
  }
}

function formToPayload(state: AboutFormState): AboutPagePayload {
  return {
    title: state.title.trim(),
    subtitle: state.subtitle.trim(),
    eyebrow: state.eyebrow.trim(),
    heroImage: state.heroImage.trim(),
    storyTitle: state.storyTitle.trim(),
    story: state.storyText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean),
    missionTitle: state.missionTitle.trim(),
    mission: state.mission.trim(),
    visionTitle: state.visionTitle.trim(),
    vision: state.vision.trim(),
    stats: state.stats
      .map(s => ({
        ...s,
        icon: s.icon.trim(),
        value: s.value.trim(),
        label: s.label.trim(),
      }))
      .filter(s => s.value || s.label),
    values: state.values
      .map(v => ({
        ...v,
        icon: v.icon.trim(),
        title: v.title.trim(),
        description: v.description.trim(),
      }))
      .filter(v => v.title),
    milestones: state.milestones
      .map(m => ({
        ...m,
        year: m.year.trim(),
        title: m.title.trim(),
        description: m.description.trim(),
      }))
      .filter(m => m.title || m.year),
    teamTitle: state.teamTitle.trim(),
    teamSubtitle: state.teamSubtitle.trim(),
    team: state.team
      .map(m => ({
        ...m,
        name: m.name.trim(),
        role: m.role.trim(),
        bio: m.bio.trim(),
        image: m.image.trim(),
      }))
      .filter(m => m.name),
    cta: {
      title: state.cta.title.trim(),
      subtitle: state.cta.subtitle.trim(),
      primaryLabel: state.cta.primaryLabel.trim(),
      primaryTo: state.cta.primaryTo.trim(),
      secondaryLabel: state.cta.secondaryLabel.trim(),
      secondaryTo: state.cta.secondaryTo.trim(),
    },
  }
}

onMounted(() => {
  ensureSeeded()
  form.value = payloadToForm(about.value)
  ready.value = true
})

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.title.trim()) next.title = t('عنوان الزامی است')
  if (!form.value.subtitle.trim()) next.subtitle = t('زیرعنوان الزامی است')
  if (!form.value.heroImage.trim()) next.heroImage = t('تصویر هیرو الزامی است')
  if (!form.value.storyText.trim()) next.storyText = t('متن داستان الزامی است')
  if (!form.value.mission.trim()) next.mission = t('ماموریت الزامی است')
  if (!form.value.vision.trim()) next.vision = t('چشم‌انداز الزامی است')
  errors.value = next
  return !Object.keys(next).length
}

function onSave() {
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }
  saving.value = true
  try {
    updateAbout(formToPayload(form.value))
    toast.success(t('صفحه درباره ما ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}

function onReset() {
  resetToDefaults()
  form.value = payloadToForm(about.value)
  errors.value = {}
  toast.success(t('به محتوای پیش‌فرض برگشت'))
}
</script>
