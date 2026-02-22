<script lang="ts">
  import { onMount } from 'svelte';
  import { topics } from '$lib/topics';
  import { history, favorites, loadFromStorage, saveToStorage } from '$lib/stores';
  import type { Topic } from '$lib/types';
  import { fly, fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let currentTopic: Topic | null = null;
  let isGenerating = false;
  let showFavorites = false;
  let showHistory = false;

  // Load data from localStorage on mount
  onMount(() => {
    loadFromStorage();
  });

  // Save data when stores change
  $: {
    if (typeof window !== 'undefined') {
      saveToStorage($history, $favorites);
    }
  }

  function generateTopic() {
    isGenerating = true;
    
    // Small delay for animation effect
    setTimeout(() => {
      // Get recently used topic IDs (last 5)
      const recentIds = $history.slice(0, 5).map(h => h.topic.id);
      
      // Filter out recent topics
      const availableTopics = topics.filter(t => !recentIds.includes(t.id));
      
      // If all topics are in history, use full list
      const pool = availableTopics.length > 0 ? availableTopics : topics;
      
      // Pick random topic
      const randomIndex = Math.floor(Math.random() * pool.length);
      currentTopic = pool[randomIndex];
      
      // Add to history
      history.add(currentTopic);
      
      isGenerating = false;
    }, 300);
  }

  function toggleFavorite() {
    if (currentTopic) {
      favorites.toggle(currentTopic);
    }
  }

  function isFavorite(topic: Topic): boolean {
    return $favorites.some(f => f.id === topic.id);
  }

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Step': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tradition': 'bg-amber-100 text-amber-800 border-amber-200',
      'Promise': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Big Book': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Discussion': 'bg-purple-100 text-purple-800 border-purple-200',
      'Daily Reflection': 'bg-rose-100 text-rose-800 border-rose-200',
      'Program': 'bg-teal-100 text-teal-800 border-teal-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function clearHistory() {
    if (confirm('Clear all topic history?')) {
      history.clear();
    }
  }

  function clearFavorites() {
    if (confirm('Remove all favorites?')) {
      favorites.clear();
    }
  }

  // Calculate sobriety date (June 3rd, 2023)
  const sobrietyDate = new Date('2023-06-03');
  const today = new Date();
  const daysSober = Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24));
  const yearsSober = Math.floor(daysSober / 365);
  const remainingDays = daysSober % 365;
</script>

<svelte:head>
  <title>AA Meeting Topic Generator</title>
  <meta name="description" content="Generate AA meeting topics from conference-approved literature" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">AA Topic Generator</h1>
            <p class="text-xs text-gray-500">Conference-Approved Literature</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            on:click={() => showHistory = !showHistory}
            class="p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            title="History"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            on:click={() => showFavorites = !showFavorites}
            class="p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors relative"
            title="Favorites"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {#if $favorites.length > 0}
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{$favorites.length}</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-4 py-8">
    <!-- Sobriety Counter -->
    <div class="text-center mb-8" in:fade>
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-blue-100">
        <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="text-sm text-gray-600">
          {#if yearsSober > 0}
            <span class="font-semibold text-blue-700">{yearsSober}</span> year{yearsSober !== 1 ? 's' : ''}
            {#if remainingDays > 0}
              <span class="text-gray-500">, </span>
              <span class="font-semibold text-blue-700">{remainingDays}</span> days
            {/if}
          {:else}
            <span class="font-semibold text-blue-700">{daysSober}</span> days
          {/if}
          <span class="text-gray-500"> sober</span>
        </span>
      </div>
    </div>

    <!-- Main Generator Card -->
    <div class="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-8">
      <div class="p-8">
        {#if currentTopic}
          <div in:scale={{ duration: 300, easing: quintOut }} class="text-center">
            <!-- Category Badge -->
            <div class="mb-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border {getCategoryColor(currentTopic.category)}">
                {currentTopic.category}
              </span>
            </div>

            <!-- Topic Title -->
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {currentTopic.title}
            </h2>

            <!-- Description -->
            {#if currentTopic.description}
              <p class="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
                {currentTopic.description}
              </p>
            {/if}

            <!-- Actions -->
            <div class="flex items-center justify-center gap-3">
              <button
                on:click={toggleFavorite}
                class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors {isFavorite(currentTopic) ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}"
              >
                <svg class="w-5 h-5 {isFavorite(currentTopic) ? 'fill-current' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite(currentTopic) ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        {:else}
          <div class="text-center py-12" in:fade>
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Ready to Generate a Topic?</h2>
            <p class="text-gray-500">Click the button below to get a random AA meeting topic</p>
          </div>
        {/if}
      </div>

      <!-- Generate Button Area -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
        <button
          on:click={generateTopic}
          disabled={isGenerating}
          class="w-full py-4 px-6 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {#if isGenerating}
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Topic
          {/if}
        </button>
      </div>
    </div>

    <!-- Topic Categories Info -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {#each [
        { name: 'Steps', count: 12, color: 'bg-blue-100 text-blue-700' },
        { name: 'Traditions', count: 12, color: 'bg-amber-100 text-amber-700' },
        { name: 'Promises', count: 12, color: 'bg-emerald-100 text-emerald-700' },
        { name: 'Topics', count: topics.length - 36, color: 'bg-purple-100 text-purple-700' },
      ] as stat}
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div class="text-2xl font-bold {stat.color} rounded-lg py-1 px-2 inline-block mb-1">{stat.count}</div>
          <div class="text-sm text-gray-600">{stat.name}</div>
        </div>
      {/each}
    </div>

    <!-- Favorites Panel -->
    {#if showFavorites}
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8" in:fly={{ y: 20, duration: 200 }} out:fade>
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            Favorite Topics
          </h3>
          {#if $favorites.length > 0}
            <button on:click={clearFavorites} class="text-sm text-red-600 hover:text-red-700">Clear All</button>
          {/if}
        </div>
        
        {#if $favorites.length === 0}
          <div class="p-8 text-center text-gray-500">
            No favorites yet. Save topics you like!
          </div>
        {:else}
          <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {#each $favorites as favorite}
              <div class="p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium px-2 py-0.5 rounded-full {getCategoryColor(favorite.category)}">{favorite.category}</span>
                    </div>
                    <p class="font-medium text-gray-900">{favorite.title}</p>
                  </div>
                  <button
                    on:click={() => favorites.remove(favorite.id)}
                    class="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- History Panel -->
    {#if showHistory}
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8" in:fly={{ y: 20, duration: 200 }} out:fade>
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Topics
          </h3>
          {#if $history.length > 0}
            <button on:click={clearHistory} class="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          {/if}
        </div>
        
        {#if $history.length === 0}
          <div class="p-8 text-center text-gray-500">
            No topics generated yet.
          </div>
        {:else}
          <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {#each $history as entry}
              <div class="p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium px-2 py-0.5 rounded-full {getCategoryColor(entry.topic.category)}">{entry.topic.category}</span>
                      <span class="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
                    </div>
                    <p class="font-medium text-gray-900">{entry.topic.title}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Footer Quote -->
    <div class="text-center text-gray-500 text-sm">
      <p class="italic">"Let us love you until you can love yourself."</p>
      <p class="mt-2 text-xs">Topics from AA conference-approved literature</p>
    </div>
  </main>
</div>
