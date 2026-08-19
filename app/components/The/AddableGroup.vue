<script setup lang="ts">
    interface Item {
      [key: string]: any;
    }
    
    const props = defineProps({
      modelValue: {
        type: Array as () => Item[],
        default: () => []
      },
      max: {
        type: Number,
        default: 5
      },
      requiredFields: {
        type: Array as () => string[],   // فیلدهایی که باید پر باشند
        default: () => []
      }
    });
    
    const emit = defineEmits(['update:modelValue', 'validationError']);
    
    const items = ref<Item[]>([...props.modelValue]);
    const errors = ref<boolean[]>([]); // برای هر آیتم یک فلگ ارور
    
    const validateItem = (index: number) => {
      const item = items.value[index];
      let hasError = false;
    
      for (const field of props.requiredFields) {
        if (!item[field]) {
          hasError = true;
          break;
        }
      }
    
      errors.value[index] = hasError;
      emit('validationError', hasError);
      return hasError;
    };
    
    const addItem = () => {
      if (items.value.length >= props.max) return;
    
      items.value.push({});
      errors.value.push(false);
    
      emit('update:modelValue', items.value);
    };
    
    const removeItem = (index: number) => {
      items.value.splice(index, 1);
      errors.value.splice(index, 1);
    
      emit('update:modelValue', items.value);
    };
    
    watch(
      () => props.modelValue,
      (v) => {
        items.value = [...v];
      }
    );
    </script>
    
    <template>
      <div class="flex flex-col gap-3">
    <div class="flex justify-between items-center mt-6">
      <p class="font-700 text-(base gray-800) leading-6.5">{{ $t('اسناد من') }}</p>

        <TheButton @click="addItem" :disable="items.length >= max" :label="$t('افزودن سند')" :appendIcon='false' icon="add"  />
    </div>
        <div
          v-for="(item, index) in items"
          :key="index"
          class="border rounded-xl"
          :class="errors[index] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'"
        >
          <!-- فرم توسط اسلات -->
          <slot name="form" :removeItem="removeItem" :item="item" :index="index" :validate="() => validateItem(index)" />
    
          <!-- <div class="flex justify-end mt-2">
            <button class="text-red-600 text-sm" @click="removeItem(index)">حذف</button>
          </div> -->
        </div>
    

      </div>
    </template>
    