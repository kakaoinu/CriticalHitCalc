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

                // ▼ 修正箇所：「補助武器」「SubWeapon」は除外した上で、武器や鎧にベース入力欄を出す 
                const isBaseTarget = (section.includes('Weapon') || section.includes('Armor') || section.includes('武器') || section.includes('鎧')) 
                     && !section.includes('SubWeapon') && !section.includes('補助武器');
                
                if (isBaseTarget) {
                    const inputWrapper = document.createElement('div');
                    inputWrapper.style.marginBottom = '10px';

                    const label = document.createElement('label');
                    label.textContent = 'ベース致命減少値';
                    label.style.marginRight = '10px';

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.placeholder = '0';
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

                // アイテムや入力欄を並べるコンテナ
                const itemsDiv = document.createElement('div');
                itemsDiv.className = 'items';
                itemsDiv.style.display = 'flex';
                itemsDiv.style.flexWrap = 'wrap';
                itemsDiv.style.gap = '12px';
                itemsDiv.style.alignItems = 'center';

                items.forEach(item => {
                    // 【自動分岐】valueが定義されていない場合は「実数入力欄」を作成
                    if (item.value === undefined || item.value === null) {
                        const inputWrapper = document.createElement('div');
                        inputWrapper.style.display = 'flex';
                        inputWrapper.style.alignItems = 'center';
                        inputWrapper.style.marginRight = '10px';
                        inputWrapper.style.marginBottom = '5px';

                        const label = document.createElement('label');
                        label.textContent = item.name;
                        label.style.marginRight = '8px';
                        label.style.fontWeight = '500';

                        const input = document.createElement('input');
                        input.type = 'number';
                        input.placeholder = '0';
                        input.className = 'user-input';
                        input.style.width = '80px';
                        input.addEventListener('input', function () {
                            this.value = this.value.replace(/[^0-9]/g, '');
                            updateOverallTotal();
                        });

                        inputWrapper.appendChild(label);
                        inputWrapper.appendChild(input);
                        itemsDiv.appendChild(inputWrapper);
                    } 
                    // 【自動分岐】valueが定義されている場合は従来通りの「選択ボタン」を作成
                    else {
                        const span = document.createElement('span');
                        span.className = 'item';
                        span.textContent = `${item.name} (${item.value})`;
                        span.dataset.value = item.value;

                        span.addEventListener('click', () => {
                            if (section === 'Ring' || section === 'Special') {
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
                    }
                });

                sectionDiv.appendChild(itemsDiv);
                container.appendChild(sectionDiv);
            }

            // ▼ 合計値の計算処理 ▼
            function updateOverallTotal() {
                let total = 0;

                document.querySelectorAll('.section').forEach(section => {
                    // 選択されたボタン（span）の数値を合算
                    const selectedItems = section.querySelectorAll('.item.selected');
                    selectedItems.forEach(item => {
                        total += parseInt(item.dataset.value) || 0;
                    });

                    // すべての入力欄（input）の数値を合算
                    const inputs = section.querySelectorAll('.user-input');
                    inputs.forEach(input => {
                        total += parseInt(input.value) || 0;
                    });
                });

                document.getElementById('overallTotal').textContent = total;
                saveState(); // 状態を保存
            }

            // ▼ 状態の保存処理 ▼
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

                    // セクション内のすべての入力欄の値を配列で保存
                    const inputs = section.querySelectorAll('.user-input');
                    if (inputs.length > 0) {
                        state.inputs[index] = Array.from(inputs).map(inp => inp.value);
                    }
                });

                localStorage.setItem('appState', JSON.stringify(state));
            }

            // ▼ 状態の復元処理 ▼
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

                    // 入力欄の復元処理（複数入力・単一入力の互換性を維持）
                    const inputs = section.querySelectorAll('.user-input');
                    if (inputs.length > 0 && state.inputs[index] !== undefined) {
                        const savedInputs = state.inputs[index];
                        
                        if (Array.isArray(savedInputs)) {
                            inputs.forEach((inp, i) => {
                                inp.value = savedInputs[i] || '';
                            });
                        } else {
                            inputs[0].value = savedInputs; // 過去のセーブデータ用
                        }
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