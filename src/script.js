class SortingVisualizer {
    constructor() {
        this.array = [];
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 200;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.currentAlgorithm = 'bubble';
        this.sortOrder = 'ascending';
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateAlgorithmInfo();
        this.generateArray();
        
        // Add window resize listener to re-check label visibility
        window.addEventListener('resize', () => {
            this.updateLabelsVisibility();
        });
    }

    initializeElements() {
        // Control elements
        this.algorithmSelect = document.getElementById('algorithm-select');
        this.datasetSelect = document.getElementById('dataset-select');
        this.arraySizeSlider = document.getElementById('array-size');
        this.speedSlider = document.getElementById('speed-control');
        this.sortOrderSelect = document.getElementById('sort-order');
        this.showLabelsCheckbox = document.getElementById('show-labels');
        this.customInputPanel = document.getElementById('custom-input-panel');
        this.customArrayInput = document.getElementById('custom-array');
        
        // Button elements
        this.generateBtn = document.getElementById('generate-btn');
        this.sortBtn = document.getElementById('sort-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.applyCustomBtn = document.getElementById('apply-custom');
        
        // Display elements
        this.arrayContainer = document.getElementById('array-container');
        this.sizeValue = document.getElementById('size-value');
        this.speedValue = document.getElementById('speed-value');
        this.comparisonsCount = document.getElementById('comparisons-count');
        this.swapsCount = document.getElementById('swaps-count');
        this.timeElapsed = document.getElementById('time-elapsed');
        this.arraySizeDisplay = document.getElementById('array-size-display');
        
        // Algorithm info elements
        this.algoName = document.getElementById('algo-name');
        this.bestCase = document.getElementById('best-case');
        this.avgCase = document.getElementById('avg-case');
        this.worstCase = document.getElementById('worst-case');
        this.spaceComplexity = document.getElementById('space-complexity');
        this.stability = document.getElementById('stability');
        this.algoDescription = document.getElementById('algo-description');
    }

    setupEventListeners() {
        this.algorithmSelect.addEventListener('change', () => {
            this.currentAlgorithm = this.algorithmSelect.value;
            this.updateAlgorithmInfo();
        });

        this.datasetSelect.addEventListener('change', () => {
            const isCustom = this.datasetSelect.value === 'custom';
            this.customInputPanel.style.display = isCustom ? 'block' : 'none';
            if (!isCustom) this.generateArray();
        });

        this.arraySizeSlider.addEventListener('input', () => {
            this.sizeValue.textContent = this.arraySizeSlider.value;
            if (this.datasetSelect.value !== 'custom') {
                this.generateArray();
            }
        });

        this.speedSlider.addEventListener('input', () => {
            this.speedValue.textContent = this.speedSlider.value;
            this.animationSpeed = 300 - (parseInt(this.speedSlider.value) * 25);
        });

        this.sortOrderSelect.addEventListener('change', () => {
            this.sortOrder = this.sortOrderSelect.value;
        });

        this.showLabelsCheckbox.addEventListener('change', () => {
            this.toggleLabels();
        });

        this.generateBtn.addEventListener('click', () => this.generateArray());
        this.sortBtn.addEventListener('click', () => this.startSorting());
        this.pauseBtn.addEventListener('click', () => this.pauseSorting());
        this.resetBtn.addEventListener('click', () => this.resetArray());
        this.applyCustomBtn.addEventListener('click', () => this.applyCustomArray());
    }

    generateArray() {
        if (this.isRunning) return;
        
        const size = parseInt(this.arraySizeSlider.value);
        const datasetType = this.datasetSelect.value;
        
        this.array = [];
        
        switch (datasetType) {
            case 'random':
                for (let i = 0; i < size; i++) {
                    this.array.push(Math.floor(Math.random() * 300) + 10);
                }
                break;
            case 'reversed':
                for (let i = size; i > 0; i--) {
                    this.array.push(i * 3 + 10);
                }
                break;
            case 'nearly-sorted':
                for (let i = 1; i <= size; i++) {
                    this.array.push(i * 3 + 10);
                }
                // Shuffle a few elements
                for (let i = 0; i < Math.floor(size / 10); i++) {
                    const idx1 = Math.floor(Math.random() * size);
                    const idx2 = Math.floor(Math.random() * size);
                    [this.array[idx1], this.array[idx2]] = [this.array[idx2], this.array[idx1]];
                }
                break;
            case 'few-unique':
                const values = [50, 100, 150, 200, 250];
                for (let i = 0; i < size; i++) {
                    this.array.push(values[Math.floor(Math.random() * values.length)]);
                }
                break;
        }
        
        this.resetStats();
        this.renderArray();
    }

    applyCustomArray() {
        const input = this.customArrayInput.value.trim();
        if (!input) {
            alert('Please enter some numbers!');
            return;
        }
        
        try {
            const numbers = input.split(',').map(num => {
                const parsed = parseInt(num.trim());
                if (isNaN(parsed) || parsed < 1 || parsed > 500) {
                    throw new Error('Invalid number');
                }
                return parsed;
            });
            
            if (numbers.length < 2) {
                alert('Please enter at least 2 numbers!');
                return;
            }
            
            if (numbers.length > 100) {
                alert('Maximum 100 numbers allowed!');
                return;
            }
            
            this.array = numbers;
            this.resetStats();
            this.renderArray();
        } catch (error) {
            alert('Invalid input! Please enter numbers between 1-500, separated by commas.');
        }
    }

    renderArray() {
        this.arrayContainer.innerHTML = '';
        this.arraySizeDisplay.textContent = this.array.length;
        
        const maxValue = Math.max(...this.array);
        const containerWidth = this.arrayContainer.clientWidth || 800;
        const totalGap = (this.array.length - 1) * 2;
        const availableWidth = containerWidth - totalGap;
        const barWidth = Math.max(2, Math.floor(availableWidth / this.array.length));
        
        // Ensure bars fit in container by adjusting gap if needed
        const actualTotalWidth = (barWidth * this.array.length) + totalGap;
        const gap = actualTotalWidth > containerWidth ? 1 : 2;
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // Get responsive max height based on screen size
            const maxBarHeight = this.getMaxBarHeight();
            const barHeight = Math.min(maxBarHeight, (value / maxValue) * maxBarHeight);
            
            bar.style.height = `${barHeight}px`;
            bar.style.width = `${barWidth}px`;
            bar.style.marginRight = index < this.array.length - 1 ? `${gap}px` : '0';
            bar.textContent = this.array.length <= 30 ? value : '';
            bar.dataset.index = index;
            bar.dataset.value = value;
            this.arrayContainer.appendChild(bar);
        });
        
        this.updateLabelsVisibility();
    }

    getMaxBarHeight() {
        // Get responsive max height based on screen size
        if (window.innerWidth <= 480) {
            return 180; // Very small screens
        } else if (window.innerWidth <= 768) {
            return 220; // Mobile screens
        } else {
            return 280; // Desktop screens
        }
    }

    toggleLabels() {
        this.updateLabelsVisibility();
    }

    updateLabelsVisibility() {
        const container = this.arrayContainer.parentElement;
        const shouldAutoDisable = this.shouldAutoDisableLabels();
        
        if (shouldAutoDisable) {
            // Auto-disable labels and update checkbox
            this.showLabelsCheckbox.checked = false;
            this.showLabelsCheckbox.disabled = true;
            container.classList.add('labels-hidden');
        } else {
            // Enable checkbox and respect user choice
            this.showLabelsCheckbox.disabled = false;
            if (this.showLabelsCheckbox.checked) {
                container.classList.remove('labels-hidden');
            } else {
                container.classList.add('labels-hidden');
            }
        }
    }

    shouldAutoDisableLabels() {
        const arrayLength = this.array.length;
        const screenWidth = window.innerWidth;
        
        // Auto-disable based on array size and screen width
        if (screenWidth <= 480 && arrayLength >= 20) {
            return true; // Very small screens
        } else if (screenWidth <= 768 && arrayLength >= 35) {
            return true; // Mobile screens
        } else if (arrayLength >= 50) {
            return true; // Desktop with too many elements
        }
        
        // Also check if bars would be too narrow for readable labels
        const containerWidth = this.arrayContainer.clientWidth || 800;
        const estimatedBarWidth = (containerWidth - (arrayLength * 2)) / arrayLength;
        
        if (estimatedBarWidth < 15 && arrayLength >= 30) {
            return true; // Bars too narrow for labels
        }
        
        return false;
    }

    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        // this.startTime = 0;
        this.originalMaxValue = null; // Clear stored max value
        this.updateStats();
    }

    updateStats() {
        this.comparisonsCount.textContent = this.comparisons;
        this.swapsCount.textContent = this.swaps;
        
        if (this.startTime > 0) {
            const elapsed = Date.now() - this.startTime;
            this.timeElapsed.textContent = `${elapsed}ms`;
        } else {
            this.timeElapsed.textContent = '0ms';
        }
    }

    updateAlgorithmInfo() {
        const algorithms = {
            bubble: {
                name: 'Bubble Sort',
                best: 'O(n)',
                avg: 'O(n²)',
                worst: 'O(n²)',
                space: 'O(1)',
                stable: 'Yes',
                description: 'Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.'
            },
            selection: {
                name: 'Selection Sort',
                best: 'O(n²)',
                avg: 'O(n²)',
                worst: 'O(n²)',
                space: 'O(1)',
                stable: 'No',
                description: 'Selection sort divides the list into sorted and unsorted regions. It repeatedly selects the smallest element from the unsorted region and moves it to the end of the sorted region.'
            },
            insertion: {
                name: 'Insertion Sort',
                best: 'O(n)',
                avg: 'O(n²)',
                worst: 'O(n²)',
                space: 'O(1)',
                stable: 'Yes',
                description: 'Insertion sort builds the sorted array one element at a time by repeatedly taking an element from the unsorted portion and inserting it into the correct position in the sorted portion.'
            },
            quick: {
                name: 'Quick Sort',
                best: 'O(n log n)',
                avg: 'O(n log n)',
                worst: 'O(n²)',
                space: 'O(log n)',
                stable: 'No',
                description: 'Quick sort uses a divide-and-conquer approach. It picks a pivot element and partitions the array around the pivot, then recursively sorts the sub-arrays.'
            },
            merge: {
                name: 'Merge Sort',
                best: 'O(n log n)',
                avg: 'O(n log n)',
                worst: 'O(n log n)',
                space: 'O(n)',
                stable: 'Yes',
                description: 'Merge sort divides the array into halves, recursively sorts them, and then merges the sorted halves back together. It guarantees O(n log n) performance.'
            },
            heap: {
                name: 'Heap Sort',
                best: 'O(n log n)',
                avg: 'O(n log n)',
                worst: 'O(n log n)',
                space: 'O(1)',
                stable: 'No',
                description: 'Heap sort creates a max heap from the array and repeatedly extracts the maximum element to build the sorted array.'
            },
            cycle: {
                name: 'Cycle Sort',
                best: 'O(n²)',
                avg: 'O(n²)',
                worst: 'O(n²)',
                space: 'O(1)',
                stable: 'No',
                description: 'Cycle sort minimizes the number of writes by placing each element directly to its final position.'
            },
            merge3way: {
                name: '3-way Merge Sort',
                best: 'O(n log₃ n)',
                avg: 'O(n log₃ n)',
                worst: 'O(n log₃ n)',
                space: 'O(n)',
                stable: 'Yes',
                description: '3-way merge sort divides array into three parts instead of two, reducing the depth of recursion.'
            },
            counting: {
                name: 'Counting Sort',
                best: 'O(n + k)',
                avg: 'O(n + k)',
                worst: 'O(n + k)',
                space: 'O(k)',
                stable: 'Yes',
                description: 'Counting sort counts occurrences of each element and uses this information to place elements in sorted order.'
            },
            radix: {
                name: 'Radix Sort',
                best: 'O(d × n)',
                avg: 'O(d × n)',
                worst: 'O(d × n)',
                space: 'O(n + k)',
                stable: 'Yes',
                description: 'Radix sort sorts elements by processing individual digits from least to most significant digit.'
            },
            bucket: {
                name: 'Bucket Sort',
                best: 'O(n + k)',
                avg: 'O(n + k)',
                worst: 'O(n²)',
                space: 'O(n)',
                stable: 'Yes',
                description: 'Bucket sort distributes elements into buckets, sorts each bucket, then concatenates the results.'
            },
            pigeonhole: {
                name: 'Pigeonhole Sort',
                best: 'O(n + N)',
                avg: 'O(n + N)',
                worst: 'O(n + N)',
                space: 'O(N)',
                stable: 'Yes',
                description: 'Pigeonhole sort works by creating pigeonholes for each possible value and placing elements in their corresponding holes.'
            },
            intro: {
                name: 'IntroSort',
                best: 'O(n log n)',
                avg: 'O(n log n)',
                worst: 'O(n log n)',
                space: 'O(log n)',
                stable: 'No',
                description: 'IntroSort combines quicksort, heapsort, and insertion sort for optimal performance in all cases.'
            },
            tim: {
                name: 'TimSort',
                best: 'O(n)',
                avg: 'O(n log n)',
                worst: 'O(n log n)',
                space: 'O(n)',
                stable: 'Yes',
                description: 'TimSort is a hybrid sorting algorithm derived from merge sort and insertion sort, used in Python and Java.'
            },
            comb: {
                name: 'Comb Sort',
                best: 'O(n log n)',
                avg: 'O(n²/2ᵖ)',
                worst: 'O(n²)',
                space: 'O(1)',
                stable: 'No',
                description: 'Comb sort improves bubble sort by using a larger gap that shrinks by a factor of 1.3 each iteration.'
            }
        };
        
        const algo = algorithms[this.currentAlgorithm];
        this.algoName.textContent = algo.name;
        this.bestCase.textContent = algo.best;
        this.avgCase.textContent = algo.avg;
        this.worstCase.textContent = algo.worst;
        this.spaceComplexity.textContent = algo.space;
        this.stability.textContent = algo.stable;
        this.algoDescription.textContent = algo.description;
    }

    async startSorting() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        
        // Store original max value for consistent bar height calculations
        this.originalMaxValue = Math.max(...this.array);
        
        this.sortBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.generateBtn.disabled = true;
        
        try {
            switch (this.currentAlgorithm) {
                case 'bubble':
                    await this.bubbleSort();
                    break;
                case 'selection':
                    await this.selectionSort();
                    break;
                case 'insertion':
                    await this.insertionSort();
                    break;
                case 'quick':
                    await this.quickSort(0, this.array.length - 1);
                    break;
                case 'merge':
                    await this.mergeSort(0, this.array.length - 1);
                    break;
                case 'heap':
                    await this.heapSort();
                    break;
                case 'cycle':
                    await this.cycleSort();
                    break;
                case 'merge3way':
                    await this.merge3WaySort(0, this.array.length - 1);
                    break;
                case 'counting':
                    await this.countingSort();
                    break;
                case 'radix':
                    await this.radixSort();
                    break;
                case 'bucket':
                    await this.bucketSort();
                    break;
                case 'pigeonhole':
                    await this.pigeonholeSort();
                    break;
                case 'intro':
                    await this.introSort(0, this.array.length - 1, 2 * Math.floor(Math.log2(this.array.length)));
                    break;
                case 'tim':
                    await this.timSort();
                    break;
                case 'comb':
                    await this.combSort();
                    break;
            }
            
            if (!this.isPaused) {
                await this.showSortedAnimation();
            }
        } catch (error) {
            console.error('Sorting error:', error);
        }
        
        this.isRunning = false;
        this.sortBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.generateBtn.disabled = false;
        this.updateStats();
    }

    pauseSorting() {
        this.isPaused = true;
        this.isRunning = false;
        this.sortBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.generateBtn.disabled = false;
    }

    resetArray() {
        this.isPaused = true;
        this.isRunning = false;
        this.sortBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.generateBtn.disabled = false;
        this.originalMaxValue = null; // Clear stored max value
        
        // Clear all special classes
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => {
            bar.className = 'array-bar';
        });
        
        this.resetStats();
        this.generateArray();
    }

    async delay() {
        if (this.isPaused) throw new Error('Paused');
        return new Promise(resolve => setTimeout(resolve, this.animationSpeed));
    }

    async highlightBars(indices, className) {
        const bars = document.querySelectorAll('.array-bar');
        indices.forEach(index => {
            if (bars[index]) bars[index].classList.add(className);
        });
        await this.delay();
    }

    async clearHighlight(indices, className) {
        const bars = document.querySelectorAll('.array-bar');
        indices.forEach(index => {
            if (bars[index]) bars[index].classList.remove(className);
        });
    }

    async swap(i, j) {
        if (i === j) return;
        
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        this.swaps++;
        
        await this.highlightBars([i, j], 'swapping');
        
        // Update DOM
        const bars = document.querySelectorAll('.array-bar');
        if (bars[i] && bars[j]) {
            const tempHeight = bars[i].style.height;
            const tempContent = bars[i].textContent;
            const tempValue = bars[i].dataset.value;
            
            bars[i].style.height = bars[j].style.height;
            bars[i].textContent = bars[j].textContent;
            bars[i].dataset.value = bars[j].dataset.value;
            
            bars[j].style.height = tempHeight;
            bars[j].textContent = tempContent;
            bars[j].dataset.value = tempValue;
        }
        
        await this.clearHighlight([i, j], 'swapping');
        this.updateStats();
    }

    async compare(i, j) {
        this.comparisons++;
        await this.highlightBars([i, j], 'comparing');
        await this.clearHighlight([i, j], 'comparing');
        this.updateStats();
        
        if (this.sortOrder === 'ascending') {
            return this.array[i] > this.array[j];
        } else {
            return this.array[i] < this.array[j];
        }
    }

    // Sorting Algorithms
    async bubbleSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                if (await this.compare(j, j + 1)) {
                    await this.swap(j, j + 1);
                    swapped = true;
                }
            }
            
            // Mark the last element as sorted
            const bars = document.querySelectorAll('.array-bar');
            if (bars[n - i - 1]) bars[n - i - 1].classList.add('sorted');
            
            if (!swapped) break;
        }
        
        // Mark first element as sorted
        const bars = document.querySelectorAll('.array-bar');
        if (bars[0]) bars[0].classList.add('sorted');
    }

    async selectionSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            
            for (let j = i + 1; j < n; j++) {
                await this.highlightBars([j], 'comparing');
                this.comparisons++;
                this.updateStats();
                
                const shouldSwap = this.sortOrder === 'ascending' 
                    ? this.array[j] < this.array[minIdx] 
                    : this.array[j] > this.array[minIdx];
                    
                if (shouldSwap) {
                    await this.clearHighlight([minIdx], 'comparing');
                    minIdx = j;
                }
                await this.clearHighlight([j], 'comparing');
            }
            
            if (minIdx !== i) {
                await this.swap(i, minIdx);
            }
            
            // Mark as sorted
            const bars = document.querySelectorAll('.array-bar');
            if (bars[i]) bars[i].classList.add('sorted');
        }
        
        // Mark last element as sorted
        const bars = document.querySelectorAll('.array-bar');
        if (bars[n - 1]) bars[n - 1].classList.add('sorted');
    }

    async insertionSort() {
        const n = this.array.length;
        
        // Mark first element as sorted
        const bars = document.querySelectorAll('.array-bar');
        if (bars[0]) bars[0].classList.add('sorted');
        
        for (let i = 1; i < n; i++) {
            let key = this.array[i];
            let j = i - 1;
            
            await this.highlightBars([i], 'comparing');
            
            while (j >= 0) {
                this.comparisons++;
                this.updateStats();
                await this.highlightBars([j], 'comparing');
                
                const shouldStop = this.sortOrder === 'ascending' 
                    ? this.array[j] <= key 
                    : this.array[j] >= key;
                    
                if (shouldStop) {
                    await this.clearHighlight([j], 'comparing');
                    break;
                }
                
                // Shift element
                this.array[j + 1] = this.array[j];
                
                // Update DOM
                if (bars[j + 1]) {
                    bars[j + 1].style.height = bars[j].style.height;
                    bars[j + 1].textContent = bars[j].textContent;
                    bars[j + 1].dataset.value = bars[j].dataset.value;
                }
                
                await this.clearHighlight([j], 'comparing');
                j--;
                await this.delay();
            }
            
            this.array[j + 1] = key;
            
            // Update DOM for final position
            const maxValue = Math.max(...this.array);
            if (bars[j + 1]) {
                const maxBarHeight = this.getMaxBarHeight();
                const barHeight = Math.min(maxBarHeight, (key / maxValue) * maxBarHeight);
                bars[j + 1].style.height = `${barHeight}px`;
                bars[j + 1].textContent = this.array.length <= 30 ? key : '';
                bars[j + 1].dataset.value = key;
                bars[j + 1].classList.add('sorted');
            }
            
            await this.clearHighlight([i], 'comparing');
        }
    }

    async quickSort(low, high) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        } else if (low === high) {
            // Single element, mark as sorted
            const bars = document.querySelectorAll('.array-bar');
            if (bars[low]) bars[low].classList.add('sorted');
        }
    }

    async partition(low, high) {
        const pivot = this.array[high];
        
        // Highlight pivot
        const bars = document.querySelectorAll('.array-bar');
        if (bars[high]) bars[high].classList.add('pivot');
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (await this.compare(j, high)) {
                // array[j] > pivot, continue
            } else {
                // array[j] <= pivot
                i++;
                if (i !== j) {
                    await this.swap(i, j);
                }
            }
        }
        
        await this.swap(i + 1, high);
        
        // Clear pivot highlight and mark as sorted
        if (bars[i + 1]) {
            bars[i + 1].classList.remove('pivot');
            bars[i + 1].classList.add('sorted');
        }
        
        return i + 1;
    }

    async mergeSort(left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        } else if (left === right) {
            // Single element, mark as sorted
            const bars = document.querySelectorAll('.array-bar');
            if (bars[left]) bars[left].classList.add('sorted');
        }
    }

    async merge(left, mid, right) {
        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.comparisons++;
            this.updateStats();
            
            await this.highlightBars([k], 'comparing');
            
            const shouldTakeLeft = this.sortOrder === 'ascending' 
                ? leftArr[i] <= rightArr[j] 
                : leftArr[i] >= rightArr[j];
                
            if (shouldTakeLeft) {
                this.array[k] = leftArr[i];
                i++;
            } else {
                this.array[k] = rightArr[j];
                j++;
            }
            
            // Update DOM
            const bars = document.querySelectorAll('.array-bar');
            const maxValue = Math.max(...this.array);
            if (bars[k]) {
                const maxBarHeight = this.getMaxBarHeight();
                const barHeight = Math.min(maxBarHeight, (this.array[k] / maxValue) * maxBarHeight);
                bars[k].style.height = `${barHeight}px`;
                bars[k].textContent = this.array.length <= 30 ? this.array[k] : '';
                bars[k].dataset.value = this.array[k];
                bars[k].classList.add('sorted');
            }
            
            await this.clearHighlight([k], 'comparing');
            k++;
        }
        
        // Copy remaining elements
        while (i < leftArr.length) {
            this.array[k] = leftArr[i];
            
            const bars = document.querySelectorAll('.array-bar');
            const maxValue = Math.max(...this.array);
            if (bars[k]) {
                const maxBarHeight = this.getMaxBarHeight();
                const barHeight = Math.min(maxBarHeight, (this.array[k] / maxValue) * maxBarHeight);
                bars[k].style.height = `${barHeight}px`;
                bars[k].textContent = this.array.length <= 30 ? this.array[k] : '';
                bars[k].dataset.value = this.array[k];
                bars[k].classList.add('sorted');
            }
            
            i++;
            k++;
            await this.delay();
        }
        
        while (j < rightArr.length) {
            this.array[k] = rightArr[j];
            
            const bars = document.querySelectorAll('.array-bar');
            const maxValue = Math.max(...this.array);
            if (bars[k]) {
                const maxBarHeight = this.getMaxBarHeight();
                const barHeight = Math.min(maxBarHeight, (this.array[k] / maxValue) * maxBarHeight);
                bars[k].style.height = `${barHeight}px`;
                bars[k].textContent = this.array.length <= 30 ? this.array[k] : '';
                bars[k].dataset.value = this.array[k];
                bars[k].classList.add('sorted');
            }
            
            j++;
            k++;
            await this.delay();
        }
    }

    // Heap Sort Implementation
    async heapSort() {
        const n = this.array.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            await this.swap(0, i);
            
            // Mark as sorted
            const bars = document.querySelectorAll('.array-bar');
            if (bars[i]) bars[i].classList.add('sorted');
            
            await this.heapify(i, 0);
        }
        
        // Mark first element as sorted
        const bars = document.querySelectorAll('.array-bar');
        if (bars[0]) bars[0].classList.add('sorted');
    }
    
    async heapify(n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        
        if (left < n) {
            this.comparisons++;
            await this.highlightBars([left, largest], 'comparing');
            const shouldSwapLeft = this.sortOrder === 'ascending' 
                ? this.array[left] > this.array[largest]
                : this.array[left] < this.array[largest];
            if (shouldSwapLeft) largest = left;
            await this.clearHighlight([left, largest === left ? i : largest], 'comparing');
        }
        
        if (right < n) {
            this.comparisons++;
            await this.highlightBars([right, largest], 'comparing');
            const shouldSwapRight = this.sortOrder === 'ascending' 
                ? this.array[right] > this.array[largest]
                : this.array[right] < this.array[largest];
            if (shouldSwapRight) largest = right;
            await this.clearHighlight([right, largest === right ? (largest === left ? left : i) : largest], 'comparing');
        }
        
        if (largest !== i) {
            await this.swap(i, largest);
            await this.heapify(n, largest);
        }
        
        this.updateStats();
    }
    
    // Cycle Sort Implementation
    async cycleSort() {
        let writes = 0;
        
        for (let cycleStart = 0; cycleStart < this.array.length - 1; cycleStart++) {
            let item = this.array[cycleStart];
            let pos = cycleStart;
            
            await this.highlightBars([cycleStart], 'comparing');
            
            // Find position where we put the item
            for (let i = cycleStart + 1; i < this.array.length; i++) {
                this.comparisons++;
                await this.highlightBars([i], 'comparing');
                
                const shouldIncrement = this.sortOrder === 'ascending' 
                    ? this.array[i] < item
                    : this.array[i] > item;
                if (shouldIncrement) pos++;
                
                await this.clearHighlight([i], 'comparing');
                this.updateStats();
            }
            
            if (pos === cycleStart) {
                await this.clearHighlight([cycleStart], 'comparing');
                continue;
            }
            
            // Skip duplicates
            while (item === this.array[pos]) {
                pos++;
            }
            
            if (pos !== cycleStart) {
                [item, this.array[pos]] = [this.array[pos], item];
                writes++;
                await this.updateBarHeight(pos, this.array[pos]);
                await this.highlightBars([pos], 'swapping');
                await this.clearHighlight([pos], 'swapping');
            }
            
            // Rotate the rest of the cycle
            while (pos !== cycleStart) {
                pos = cycleStart;
                
                for (let i = cycleStart + 1; i < this.array.length; i++) {
                    this.comparisons++;
                    const shouldIncrement = this.sortOrder === 'ascending' 
                        ? this.array[i] < item
                        : this.array[i] > item;
                    if (shouldIncrement) pos++;
                }
                
                while (item === this.array[pos]) {
                    pos++;
                }
                
                if (this.array[pos] !== item) {
                    [item, this.array[pos]] = [this.array[pos], item];
                    writes++;
                    await this.updateBarHeight(pos, this.array[pos]);
                    await this.highlightBars([pos], 'swapping');
                    await this.clearHighlight([pos], 'swapping');
                }
                
                this.updateStats();
            }
            
            await this.clearHighlight([cycleStart], 'comparing');
        }
        
        // Mark all as sorted
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => bar.classList.add('sorted'));
    }
    
    // 3-way Merge Sort Implementation
    async merge3WaySort(low, high) {
        if (low < high) {
            const mid1 = low + Math.floor((high - low) / 3);
            const mid2 = low + 2 * Math.floor((high - low) / 3) + 1;
            
            await this.merge3WaySort(low, mid1);
            await this.merge3WaySort(mid1 + 1, mid2);
            await this.merge3WaySort(mid2 + 1, high);
            
            await this.merge3Way(low, mid1, mid2, high);
        }
    }
    
    async merge3Way(low, mid1, mid2, high) {
        const temp = [...this.array.slice(low, high + 1)];
        let i = 0, j = mid1 - low + 1, k = mid2 - low + 1;
        let l = low;
        
        while (i <= mid1 - low && j <= mid2 - low && k <= high - low) {
            this.comparisons += 2;
            
            const shouldTakeFirst = this.sortOrder === 'ascending' 
                ? temp[i] <= temp[j] && temp[i] <= temp[k]
                : temp[i] >= temp[j] && temp[i] >= temp[k];
            const shouldTakeSecond = this.sortOrder === 'ascending' 
                ? temp[j] <= temp[k]
                : temp[j] >= temp[k];
                
            if (shouldTakeFirst) {
                this.array[l] = temp[i++];
            } else if (shouldTakeSecond) {
                this.array[l] = temp[j++];
            } else {
                this.array[l] = temp[k++];
            }
            
            await this.updateBarHeight(l, this.array[l]);
            await this.highlightBars([l], 'sorted');
            l++;
            this.updateStats();
        }
        
        // Copy remaining elements
        while (i <= mid1 - low && j <= mid2 - low) {
            const shouldTakeFirst = this.sortOrder === 'ascending' 
                ? temp[i] <= temp[j]
                : temp[i] >= temp[j];
            this.array[l] = shouldTakeFirst ? temp[i++] : temp[j++];
            await this.updateBarHeight(l++, this.array[l - 1]);
        }
        
        while (j <= mid2 - low && k <= high - low) {
            const shouldTakeSecond = this.sortOrder === 'ascending' 
                ? temp[j] <= temp[k]
                : temp[j] >= temp[k];
            this.array[l] = shouldTakeSecond ? temp[j++] : temp[k++];
            await this.updateBarHeight(l++, this.array[l - 1]);
        }
        
        while (i <= mid1 - low && k <= high - low) {
            const shouldTakeFirst = this.sortOrder === 'ascending' 
                ? temp[i] <= temp[k]
                : temp[i] >= temp[k];
            this.array[l] = shouldTakeFirst ? temp[i++] : temp[k++];
            await this.updateBarHeight(l++, this.array[l - 1]);
        }
        
        while (i <= mid1 - low) this.array[l] = temp[i++], await this.updateBarHeight(l++, this.array[l - 1]);
        while (j <= mid2 - low) this.array[l] = temp[j++], await this.updateBarHeight(l++, this.array[l - 1]);
        while (k <= high - low) this.array[l] = temp[k++], await this.updateBarHeight(l++, this.array[l - 1]);
    }
    
    // Counting Sort Implementation
    async countingSort() {
        const max = Math.max(...this.array);
        const min = Math.min(...this.array);
        const range = max - min + 1;
        const count = new Array(range).fill(0);
        const output = new Array(this.array.length);
        
        // Count occurrences
        for (let i = 0; i < this.array.length; i++) {
            count[this.array[i] - min]++;
            await this.highlightBars([i], 'comparing');
            await this.clearHighlight([i], 'comparing');
            this.comparisons++;
            this.updateStats();
        }
        
        // Modify count array
        if (this.sortOrder === 'ascending') {
            for (let i = 1; i < count.length; i++) {
                count[i] += count[i - 1];
            }
        } else {
            for (let i = count.length - 2; i >= 0; i--) {
                count[i] += count[i + 1];
            }
        }
        
        // Build output array
        for (let i = this.array.length - 1; i >= 0; i--) {
            const index = this.sortOrder === 'ascending' 
                ? count[this.array[i] - min] - 1
                : count[this.array[i] - min] - 1;
            output[index] = this.array[i];
            count[this.array[i] - min]--;
            
            await this.highlightBars([i], 'swapping');
            await this.clearHighlight([i], 'swapping');
        }
        
        // Copy back to original array and recalculate bar heights properly
        for (let i = 0; i < this.array.length; i++) {
            this.array[i] = output[i];
            await this.updateBarHeight(i, this.array[i]);
            await this.highlightBars([i], 'sorted');
        }
    }
    
    // Radix Sort Implementation
    async radixSort() {
        const max = Math.max(...this.array);
        
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            await this.countingSortByDigit(exp);
        }
        
        // Mark all as sorted
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => bar.classList.add('sorted'));
    }
    
    async countingSortByDigit(exp) {
        const output = new Array(this.array.length);
        const count = new Array(10).fill(0);
        
        // Count occurrences of digits
        for (let i = 0; i < this.array.length; i++) {
            const digit = Math.floor(this.array[i] / exp) % 10;
            count[digit]++;
            await this.highlightBars([i], 'comparing');
            await this.clearHighlight([i], 'comparing');
        }
        
        // Change count[i] to actual position
        if (this.sortOrder === 'ascending') {
            for (let i = 1; i < 10; i++) {
                count[i] += count[i - 1];
            }
        } else {
            for (let i = 8; i >= 0; i--) {
                count[i] += count[i + 1];
            }
        }
        
        // Build output array
        for (let i = this.array.length - 1; i >= 0; i--) {
            const digit = Math.floor(this.array[i] / exp) % 10;
            const index = this.sortOrder === 'ascending' 
                ? count[digit] - 1
                : count[digit] - 1;
            output[index] = this.array[i];
            count[digit]--;
            
            await this.highlightBars([i], 'swapping');
            await this.clearHighlight([i], 'swapping');
        }
        
        // Copy back and recalculate bar heights properly
        for (let i = 0; i < this.array.length; i++) {
            this.array[i] = output[i];
            await this.updateBarHeight(i, this.array[i]);
        }
    }
    
    // Bucket Sort Implementation
    async bucketSort() {
        const bucketCount = Math.min(10, this.array.length);
        const buckets = Array.from({ length: bucketCount }, () => []);
        const max = Math.max(...this.array);
        const min = Math.min(...this.array);
        const range = max - min + 1;
        
        // Distribute elements into buckets
        for (let i = 0; i < this.array.length; i++) {
            const bucketIndex = Math.floor(((this.array[i] - min) / range) * bucketCount);
            const actualIndex = Math.min(bucketIndex, bucketCount - 1);
            buckets[actualIndex].push(this.array[i]);
            
            await this.highlightBars([i], 'comparing');
            await this.clearHighlight([i], 'comparing');
        }
        
        // Sort individual buckets and concatenate
        let index = 0;
        for (let bucket of buckets) {
            if (bucket.length > 0) {
                bucket.sort((a, b) => this.sortOrder === 'ascending' ? a - b : b - a);
                
                for (let value of bucket) {
                    this.array[index] = value;
                    await this.updateBarHeight(index, value);
                    await this.highlightBars([index], 'sorted');
                    index++;
                }
            }
        }
    }
    
    // Pigeonhole Sort Implementation
    async pigeonholeSort() {
        const min = Math.min(...this.array);
        const max = Math.max(...this.array);
        const range = max - min + 1;
        const holes = new Array(range).fill(null).map(() => []);
        
        // Put elements into holes
        for (let i = 0; i < this.array.length; i++) {
            holes[this.array[i] - min].push(this.array[i]);
            await this.highlightBars([i], 'comparing');
            await this.clearHighlight([i], 'comparing');
        }
        
        // Put elements back
        let index = 0;
        if (this.sortOrder === 'ascending') {
            for (let i = 0; i < range; i++) {
                while (holes[i].length > 0) {
                    this.array[index] = holes[i].pop();
                    await this.updateBarHeight(index, this.array[index]);
                    await this.highlightBars([index], 'sorted');
                    index++;
                }
            }
        } else {
            for (let i = range - 1; i >= 0; i--) {
                while (holes[i].length > 0) {
                    this.array[index] = holes[i].pop();
                    await this.updateBarHeight(index, this.array[index]);
                    await this.highlightBars([index], 'sorted');
                    index++;
                }
            }
        }
    }
    
    // IntroSort Implementation
    async introSort(low, high, depthLimit) {
        await this.introSortRecursive(low, high, depthLimit);
        
        // Mark all as sorted with green color
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => bar.classList.add('sorted'));
    }
    
    async introSortRecursive(low, high, depthLimit) {
        while (high > low) {
            if (high - low + 1 < 16) {
                await this.insertionSortRange(low, high);
                break;
            } else if (depthLimit === 0) {
                await this.heapSortRange(low, high);
                break;
            } else {
                const pivot = await this.partition(low, high);
                
                if (pivot - low < high - pivot) {
                    await this.introSortRecursive(low, pivot - 1, depthLimit - 1);
                    low = pivot + 1;
                } else {
                    await this.introSortRecursive(pivot + 1, high, depthLimit - 1);
                    high = pivot - 1;
                }
                depthLimit--;
            }
        }
    }
    
    async insertionSortRange(low, high) {
        for (let i = low + 1; i <= high; i++) {
            let key = this.array[i];
            let j = i - 1;
            
            await this.highlightBars([i], 'comparing');
            
            while (j >= low) {
                this.comparisons++;
                this.updateStats();
                await this.highlightBars([j], 'comparing');
                
                const shouldStop = this.sortOrder === 'ascending' 
                    ? this.array[j] <= key 
                    : this.array[j] >= key;
                    
                if (shouldStop) {
                    await this.clearHighlight([j], 'comparing');
                    break;
                }
                
                this.array[j + 1] = this.array[j];
                await this.updateBarHeight(j + 1, this.array[j + 1]);
                
                await this.clearHighlight([j], 'comparing');
                j--;
                await this.delay();
            }
            
            this.array[j + 1] = key;
            await this.updateBarHeight(j + 1, key);
            await this.clearHighlight([i], 'comparing');
        }
    }
    
    async heapSortRange(low, high) {
        const n = high - low + 1;
        
        // Build heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapifyRange(low, high, low + i);
        }
        
        // Extract elements
        for (let i = high; i > low; i--) {
            await this.swap(low, i);
            await this.heapifyRange(low, i - 1, low);
        }
    }
    
    async heapifyRange(low, high, i) {
        const n = high - low + 1;
        let largest = i;
        let left = low + 2 * (i - low) + 1;
        let right = low + 2 * (i - low) + 2;
        
        if (left <= high && await this.compare(left, largest)) {
            largest = left;
        }
        
        if (right <= high && await this.compare(right, largest)) {
            largest = right;
        }
        
        if (largest !== i) {
            await this.swap(i, largest);
            await this.heapifyRange(low, high, largest);
        }
    }
    
    // TimSort Implementation (simplified)
    async timSort() {
        const minMerge = 32;
        const n = this.array.length;
        
        // Sort individual runs
        for (let i = 0; i < n; i += minMerge) {
            const end = Math.min(i + minMerge - 1, n - 1);
            await this.insertionSortRange(i, end);
        }
        
        // Merge runs
        let size = minMerge;
        while (size < n) {
            for (let start = 0; start < n; start += size * 2) {
                const mid = start + size - 1;
                const end = Math.min(start + size * 2 - 1, n - 1);
                
                if (mid < end) {
                    await this.mergeRange(start, mid, end);
                }
            }
            size *= 2;
        }
        
        // Mark all as sorted
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => bar.classList.add('sorted'));
    }
    
    async mergeRange(left, mid, right) {
        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.comparisons++;
            this.updateStats();
            
            const shouldTakeLeft = this.sortOrder === 'ascending' 
                ? leftArr[i] <= rightArr[j] 
                : leftArr[i] >= rightArr[j];
                
            if (shouldTakeLeft) {
                this.array[k] = leftArr[i++];
            } else {
                this.array[k] = rightArr[j++];
            }
            
            await this.updateBarHeight(k, this.array[k]);
            await this.highlightBars([k], 'sorted');
            k++;
        }
        
        while (i < leftArr.length) {
            this.array[k] = leftArr[i++];
            await this.updateBarHeight(k++, this.array[k - 1]);
        }
        
        while (j < rightArr.length) {
            this.array[k] = rightArr[j++];
            await this.updateBarHeight(k++, this.array[k - 1]);
        }
    }
    
    // Comb Sort Implementation
    async combSort() {
        const n = this.array.length;
        let gap = n;
        let swapped = true;
        
        while (gap !== 1 || swapped) {
            gap = Math.floor(gap / 1.3);
            if (gap < 1) gap = 1;
            
            swapped = false;
            
            for (let i = 0; i < n - gap; i++) {
                if (await this.compare(i, i + gap)) {
                    await this.swap(i, i + gap);
                    swapped = true;
                }
            }
        }
        
        // Mark all as sorted
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => bar.classList.add('sorted'));
    }
    
    // Helper method to update bar DOM during sorting
    async updateBarDOM(index, value) {
        const bars = document.querySelectorAll('.array-bar');
        if (bars[index]) {
            const maxValue = Math.max(...this.array);
            const maxBarHeight = this.getMaxBarHeight();
            const barHeight = Math.min(maxBarHeight, (value / maxValue) * maxBarHeight);
            
            bars[index].style.height = `${barHeight}px`;
            bars[index].textContent = this.array.length <= 30 ? value : '';
            bars[index].dataset.value = value;
        }
        await this.delay();
    }
    
    // Helper method to properly update bar height with correct proportions
    async updateBarHeight(index, value) {
        const bars = document.querySelectorAll('.array-bar');
        if (bars[index]) {
            // Use the original maximum value to maintain consistent proportions
            const maxValue = this.originalMaxValue || Math.max(...this.array);
            const maxBarHeight = this.getMaxBarHeight();
            const barHeight = Math.min(maxBarHeight, (value / maxValue) * maxBarHeight);
            
            bars[index].style.height = `${barHeight}px`;
            bars[index].textContent = this.array.length <= 30 ? value : '';
            bars[index].dataset.value = value;
            
            // Force reflow to ensure visual update
            bars[index].offsetHeight;
        }
        await this.delay();
    }

    async showSortedAnimation() {
        const bars = document.querySelectorAll('.array-bar');
        
        for (let i = 0; i < bars.length; i++) {
            bars[i].classList.add('celebrate');
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        setTimeout(() => {
            bars.forEach(bar => bar.classList.remove('celebrate'));
        }, 1000);
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});
