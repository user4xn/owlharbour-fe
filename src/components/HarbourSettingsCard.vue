<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  harbourName: 'TEGAL SARI HARBOUR',
  harbourCode: '897623',
  harbourAddress: 'Tegalsari, Tegal Barat, Tegal City, Central Java 52111',
  harbourPresenceMode: 'Interval',
  harbourInterval: 30,
  harbourRange: 10,
})

const handleSubmit = () => {
  // Handle form submission for personal information
}

const handleCancel = () => {
  // Handle cancel action for personal information
}

const handlePhotoSubmit = () => {
  // Handle form submission for user photo
}
</script>

<template>
  <div class="grid grid-cols-5 gap-8">
    <!-- Personal Information Section -->
    <div class="col-span-5 xl:col-span-3">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Your Dock Information</h3>
        </div>
        <div class="p-7">
          <form @submit.prevent="handleSubmit">
            <div class="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div class="w-full sm:w-1/2">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  for="harbourName"
                  >Harbour Name</label
                >
                
                <input
                  v-model="formData.harbourName"
                  class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="harbourName"
                  id="harbourName"
                  placeholder="Owl Harbour"
                />
              </div>

              <div class="w-full sm:w-1/2">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  for="harbourCode"
                  >Harbour Code</label
                >
                <input
                  v-model="formData.harbourCode"
                  class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="harbourCode"
                  id="harbourCode"
                  placeholder="000000"
                />
              </div>
            </div>

            <div class="mb-5.5">
              <label
                class="mb-3 block text-sm font-medium text-black dark:text-white"
                for="harbourAddress"
                >Harbour Address</label
              >
              <textarea
                v-model="formData.harbourAddress"
                class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                name="harbourAddress"
                id="harbourAddress"
                placeholder="Somesubs, Somedistc, Somecity, Someprovince 150901"
              />
            </div>

            <!-- Save and Cancel Buttons -->
            <div class="flex justify-end gap-4.5">
              <button
                class="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                type="button"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                class="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                type="submit"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Your Photo Section -->
    <div class="col-span-5 xl:col-span-2">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Client App Setting</h3>
        </div>
        <div class="p-7">
          <form @submit.prevent="handlePhotoSubmit">
            <div class="w-full">
              <label
                class="mb-3 block text-sm font-medium text-black dark:text-white"
                for="harbourPresenceMode"
                >Presence Ship Mode</label
              >

              <select
                v-model="formData.harbourPresenceMode"
                class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="harbourPresenceMode"
                id="harbourPresenceMode"
              >
                <option value="Range">Range</option>
                <option value="Interval">Interval</option>
              </select>
            </div>
            <div class="mt-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div class="w-full sm:w-1/2">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  for="harbourInterval"
                  >Interval (Second)</label
                >
                
                <input
                  v-model="formData.harbourInterval"
                  class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="harbourInterval"
                  id="harbourInterval"
                  placeholder="Interval"
                />
              </div>
              <div class="w-full sm:w-1/2">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  for="harbourRange"
                  >Range (Meter)</label
                >
                
                <input
                  v-model="formData.harbourRange"
                  class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="harbourRange"
                  id="harbourRange"
                  placeholder="Range"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
