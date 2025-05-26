document.addEventListener('DOMContentLoaded', function () {
    fetch('json/sections_data.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('sections');

            for (const [section, items] of Object.entries(data)) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section';

                const title = document.createElement('h2');
                title.textContent = section;
                sectionDiv.appendChild(title);

                // ベースの致命減入力欄（WeaponとArmorのみ）
                if (section === 'Weapon' || section === 'Armor') {
                    const inputWrapper = document.createElement('div');
                    inputWrapper.style.marginBottom = '10px';

                    const label = document.createElement('label');
                    label.textContent = 'ベース致命減少値';
                    label.style.marginRight = '10px';

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.placeholder = 'Enter a number';
                    input.className = 'user-input';
                    input.style.width = '100px';
                    input.addEventListener('input', function () {
                        this.value = this.value.replace(/[^0-9]/g, '');
                        updateOverallTotal();
                    });

                    inputWrapper.appendChild(label);
                    inputWrapper.appendChild(input);
                    sectionDiv.appendChild(inputWrapper);
                }

                const itemsDiv = document.createElement('div');
                itemsDiv.className = 'items';

                items.forEach(item => {
                    const span = document.createElement('span');
                    span.className = 'item';
                    span.textContent = `${item.name} (${item.value})`;
                    span.dataset.value = item.value;

                    span.addEventListener('click', () => {
                        if (section === 'Ring') {
                            span.classList.toggle('selected');
                        } else {
                            if (span.classList.contains('selected')) {
                                span.classList.remove('selected'); // 再クリックで解除
                            } else {
                                itemsDiv.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
                                span.classList.add('selected');
                            }
                        }
                        updateOverallTotal();
                    });

                    itemsDiv.appendChild(span);
                });

                sectionDiv.appendChild(itemsDiv);
                container.appendChild(sectionDiv);
            }

            function updateOverallTotal() {
                let total = 0;

                document.querySelectorAll('.section').forEach(section => {
                    const selectedItems = section.querySelectorAll('.item.selected');
                    selectedItems.forEach(item => {
                        total += parseInt(item.dataset.value);
                    });

                    const input = section.querySelector('.user-input');
                    if (input) {
                        total += parseInt(input.value) || 0;
                    }
                });

                document.getElementById('overallTotal').textContent = total;

                saveState(); // 状態を保存
            }

            function saveState() {
                const state = {
                    selectedItems: [],
                    inputs: {}
                };

                document.querySelectorAll('.section').forEach((section, index) => {
                    const selected = section.querySelectorAll('.item.selected');
                    selected.forEach(item => {
                        state.selectedItems.push(item.textContent);
                    });

                    const input = section.querySelector('.user-input');
                    if (input) {
                        state.inputs[index] = input.value;
                    }
                });

                localStorage.setItem('appState', JSON.stringify(state));
            }

            function restoreState() {
                const state = JSON.parse(localStorage.getItem('appState'));
                if (!state) return;

                document.querySelectorAll('.section').forEach((section, index) => {
                    const items = section.querySelectorAll('.item');
                    items.forEach(item => {
                        if (state.selectedItems.includes(item.textContent)) {
                            item.classList.add('selected');
                        }
                    });

                    const input = section.querySelector('.user-input');
                    if (input && state.inputs[index] !== undefined) {
                        input.value = state.inputs[index];
                    }
                });

                updateOverallTotal();
            }

            restoreState(); // データ読み込み後に呼び出す
        })
        .catch(error => {
            console.error('JSON読み込みエラー:', error);
        });
});
