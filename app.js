// 配置
const CONFIG = {
    // OpenStreetMap 不需要 API Key！
    center: [31.2304, 121.4737], // 上海市中心坐标 [纬度, 经度]
    zoom: 12
};

// 全局变量
let map = null;
let markers = [];
let isEditMode = false;
let currentEditRestaurant = null;
let isMapPickMode = false;
let mapPickMarker = null;
let selectedImageFile = null;
let selectedMenuImageFiles = [];

// 餐厅数据存储
class RestaurantStore {
    constructor() {
        this.storageKey = 'shanghai_restaurants';
        this.load();
    }

    load() {
        const data = localStorage.getItem(this.storageKey);
        this.restaurants = data ? JSON.parse(data) : this.getDefaultData();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.restaurants));
    }

    getAll() {
        return this.restaurants;
    }

    add(restaurant) {
        restaurant.id = Date.now().toString();
        this.restaurants.push(restaurant);
        this.save();
        return restaurant;
    }

    update(id, data) {
        const index = this.restaurants.findIndex(r => r.id === id);
        if (index !== -1) {
            this.restaurants[index] = { ...this.restaurants[index], ...data };
            this.save();
            return this.restaurants[index];
        }
        return null;
    }

    delete(id) {
        this.restaurants = this.restaurants.filter(r => r.id !== id);
        this.save();
    }

    getDefaultData() {
        // 上海本帮菜餐厅数据
        // 地址已人工查证核实（2026年2月）
        // 连锁店已包含多个分店地址
        return [
            {
                id: '1',
                name: '成事园酒家（真华路店）',
                address: '上海市宝山区真华路1770号',
                lat: 31.2850,
                lng: 121.4150,
                price: '¥104',
                dishes: ['响油鳝丝', '本帮红烧肉', '清炒虾仁'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '2',
                name: '海金滋（进贤路店）',
                address: '上海市黄浦区进贤路240号（近陕西南路）',
                lat: 31.2195,
                lng: 121.4640,
                price: '¥71',
                dishes: ['葱烤大排', '排骨年糕', '上海酱鸭'],
                image: '',
                menu: '备注：主店，多次入选米其林必比登',
                xhsLink: ''
            },
            {
                id: '3',
                name: '海金滋（智汇广场店）',
                address: '上海市静安区江场三路93号2层202室',
                lat: 31.2780,
                lng: 121.4550,
                price: '¥71',
                dishes: ['葱烤大排', '排骨年糕', '上海酱鸭'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '4',
                name: '顺风大酒店（杨浦东方商厦店）',
                address: '上海市杨浦区四平路2500号东方商厦5楼',
                lat: 31.2940,
                lng: 121.5050,
                price: '¥140',
                dishes: ['腌笃鲜', '脆皮烤乳鸽', '炝腰花'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '5',
                name: '顺风大酒店（南桥百联店）',
                address: '上海市奉贤区百齐路588号百联南桥购物中心4楼',
                lat: 30.9150,
                lng: 121.4750,
                price: '¥140',
                dishes: ['腌笃鲜', '脆皮烤乳鸽', '炝腰花'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '6',
                name: '顺风大酒店（人民广场店）',
                address: '上海市黄浦区黄陂北路227号中区广场3楼',
                lat: 31.2350,
                lng: 121.4720,
                price: '¥140',
                dishes: ['腌笃鲜', '脆皮烤乳鸽', '炝腰花'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '7',
                name: '930私房菜（中华路店）',
                address: '上海市黄浦区中华路528号',
                lat: 31.2115,
                lng: 121.5010,
                price: '¥75',
                dishes: ['糯米竹蛏王', '外婆红烧肉', '花蛤猪肝'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '8',
                name: '930私房菜（国和店）',
                address: '上海市杨浦区国和路1000号商场2楼',
                lat: 31.3050,
                lng: 121.5180,
                price: '¥75',
                dishes: ['糯米竹蛏王', '外婆红烧肉', '花蛤猪肝'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '9',
                name: '930私房菜（金沙江路店）',
                address: '上海市普陀区金沙江路788号',
                lat: 31.2350,
                lng: 121.3950,
                price: '¥75',
                dishes: ['糯米竹蛏王', '外婆红烧肉', '花蛤猪肝'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '10',
                name: '金宴310本帮菜',
                address: '上海市徐汇区天平路220号',
                lat: 31.2110,
                lng: 121.4450,
                price: '¥108',
                dishes: ['葱油鸡', '酱爆猪肝', '文火牛肉'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '11',
                name: '瑞福园联谊餐室',
                address: '上海市黄浦区茂名南路132号乙（近复兴中路）',
                lat: 31.2175,
                lng: 121.4630,
                price: '¥140',
                dishes: ['响油鳝丝', '大黄鱼棒打小馄饨', '田螺塞肉'],
                image: '',
                menu: '备注：要预约，电话 021-64458999',
                xhsLink: ''
            },
            {
                id: '12',
                name: '新苑私房菜·本帮菜',
                address: '上海市徐汇区嘉善路508号尚街Loft1号楼1层102室',
                lat: 31.1965,
                lng: 121.4365,
                price: '¥118',
                dishes: ['八宝鸭', '花雕鸡', '油爆虾', '红烧肉'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '13',
                name: '光明邨大酒家（淮海中路总店）',
                address: '上海市黄浦区淮海中路588号（近成都南路）',
                lat: 31.2245,
                lng: 121.4670,
                price: '¥80',
                dishes: ['响油鳝丝', '油爆虾', '酱鸭'],
                image: '',
                menu: '备注：百年老字号总店',
                xhsLink: ''
            },
            {
                id: '14',
                name: '光明邨大酒家（汇阳广场店）',
                address: '上海市徐汇区田林东路75号汇阳广场F1',
                lat: 31.1765,
                lng: 121.4295,
                price: '¥80',
                dishes: ['响油鳝丝', '油爆虾', '酱鸭'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '15',
                name: '人和馆·上海菜（肇嘉浜路店）',
                address: '上海市徐汇区肇嘉浜路407号',
                lat: 31.2015,
                lng: 121.4470,
                price: '¥170',
                dishes: ['熏鱼', '金牌红烧肉', '蟹粉捞饭'],
                image: '',
                menu: '备注：网红餐厅，排队严重',
                xhsLink: ''
            },
            {
                id: '16',
                name: '人和馆·上海菜（绿地缤纷城店）',
                address: '上海市徐汇区漕溪北路88号绿地缤纷城',
                lat: 31.1935,
                lng: 121.4360,
                price: '¥170',
                dishes: ['熏鱼', '金牌红烧肉', '蟹粉捞饭'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '17',
                name: '鹿港小镇（黄金城道店）',
                address: '上海市长宁区黄金城道778号（近古北路）',
                lat: 31.1875,
                lng: 121.4025,
                price: '¥130',
                dishes: ['鹿港熏鱼', '酱爆猪肝'],
                image: '',
                menu: '备注：台湾菜餐厅',
                xhsLink: ''
            },
            {
                id: '18',
                name: '鹿港小镇（港汇恒隆广场店）',
                address: '上海市徐汇区虹桥路1号港汇恒隆广场5楼',
                lat: 31.1980,
                lng: 121.4280,
                price: '¥130',
                dishes: ['鹿港熏鱼', '酱爆猪肝'],
                image: '',
                menu: '备注：台湾菜餐厅',
                xhsLink: ''
            },
            {
                id: '19',
                name: '名厨本帮馆（汝南街店）',
                address: '上海市黄浦区汝南街118号（近局门路）',
                lat: 31.2235,
                lng: 121.4825,
                price: '¥80',
                dishes: ['油爆虾', '咸蛋黄排条', '响油鳝丝'],
                image: '',
                menu: '备注：本帮菜泰斗李伯荣弟子主理',
                xhsLink: ''
            },
            {
                id: '20',
                name: '名厨本帮馆（蟠龙天地店）',
                address: '上海市青浦区蟠鼎路123弄8号',
                lat: 31.1450,
                lng: 121.1250,
                price: '¥80',
                dishes: ['油爆虾', '咸蛋黄排条', '响油鳝丝'],
                image: '',
                menu: '',
                xhsLink: ''
            },
            {
                id: '21',
                name: '陈桥老饭店',
                address: '上海市浦东新区迪士尼附近（详细地址待补充）',
                lat: 31.1450,
                lng: 121.6550,
                price: '¥72',
                dishes: ['白斩鸡', '响油鳝丝', '三鲜汤'],
                image: '',
                menu: '备注：网红餐厅，建议提前预订',
                xhsLink: ''
            },
            {
                id: '22',
                name: '三玛璐酒楼',
                address: '上海市黄浦区汉口路413号',
                lat: 31.2320,
                lng: 121.4760,
                price: '¥120',
                dishes: ['椒盐排条', '本帮酱鸭腿', '韭菜花蛤炝猪肝'],
                image: '',
                menu: '备注：老字号本帮菜馆，怀旧风格',
                xhsLink: ''
            }
        ];
    }
}

// 地图选点功能
function startMapPick() {
    isMapPickMode = true;
    
    // 显示提示
    const tip = document.createElement('div');
    tip.className = 'map-pick-mode';
    tip.id = 'mapPickTip';
    tip.textContent = '👆 在地图上点击选择餐厅位置';
    document.body.appendChild(tip);
    
    // 改变地图光标
    document.getElementById('mapContainer').style.cursor = 'crosshair';
    
    // 关闭编辑弹窗，让用户能看到地图
    document.getElementById('editModal').style.display = 'none';
}

function handleMapPick(latlng) {
    // 移除旧标记
    if (mapPickMarker) {
        map.removeLayer(mapPickMarker);
    }
    
    // 添加新标记
    mapPickMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'temp-marker',
            html: '📍',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })
    }).addTo(map);
    
    // 保存坐标
    document.getElementById('editLat').value = latlng.lat.toFixed(6);
    document.getElementById('editLng').value = latlng.lng.toFixed(6);
    document.getElementById('locationStatus').textContent = '已选择位置 ✓';
    
    // 退出选点模式
    exitMapPickMode();
    
    // 重新打开编辑弹窗
    document.getElementById('editModal').style.display = 'flex';
    
    alert(`位置已选择！\n纬度：${latlng.lat.toFixed(6)}\n经度：${latlng.lng.toFixed(6)}`);
}

function exitMapPickMode() {
    isMapPickMode = false;
    document.getElementById('mapContainer').style.cursor = '';
    
    const tip = document.getElementById('mapPickTip');
    if (tip) {
        tip.remove();
    }
}

// 图片文件处理
function handleImageSelect() {
    const fileInput = document.getElementById('editImageFile');
    const file = fileInput.files[0];
    
    if (file) {
        selectedImageFile = file;
        
        // 显示文件名
        document.getElementById('imageFileName').textContent = `已选择：${file.name}`;
        
        // 预览图片
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function handleMenuImagesSelect() {
    const fileInput = document.getElementById('editMenuImagesFile');
    const files = Array.from(fileInput.files);
    
    if (files.length > 0) {
        selectedMenuImageFiles = files;
        
        // 显示预览
        const previewContainer = document.getElementById('menuImagesPreview');
        previewContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const wrapper = document.createElement('div');
                wrapper.className = 'remove-image';
                wrapper.dataset.index = index;
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                wrapper.appendChild(img);
                wrapper.onclick = function() {
                    if (confirm('删除这张图片？')) {
                        selectedMenuImageFiles.splice(index, 1);
                        wrapper.remove();
                    }
                };
                
                previewContainer.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 将图片转换为Base64存储
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const store = new RestaurantStore();

// 初始化地图
function initMap() {
    // 创建 Leaflet 地图
    map = L.map('mapContainer', {
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        zoomControl: true
    });

    // 添加 OpenStreetMap 图层（中文标注）
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    // 地图点击事件（用于选点功能）
    map.on('click', function(e) {
        if (isMapPickMode) {
            handleMapPick(e.latlng);
        }
    });

    // 加载所有餐厅标记
    loadRestaurants();
}

// 加载餐厅标记
function loadRestaurants() {
    // 清除旧标记
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const restaurants = store.getAll();
    restaurants.forEach(restaurant => {
        addMarker(restaurant);
    });
}

// 添加标记
function addMarker(restaurant) {
    // 创建自定义图标
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-inner">🍜</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const marker = L.marker([restaurant.lat, restaurant.lng], {
        icon: customIcon,
        title: restaurant.name
    }).addTo(map);

    marker.on('click', () => {
        if (isEditMode) {
            openEditModal(restaurant);
        } else {
            showRestaurantInfo(restaurant);
            // 地图中心移动到标记位置
            map.panTo([restaurant.lat, restaurant.lng]);
        }
    });

    markers.push(marker);
}

// 显示餐厅信息
function showRestaurantInfo(restaurant) {
    const infoCard = document.getElementById('infoCard');
    
    // 设置图片
    const infoImage = document.getElementById('infoImage');
    if (restaurant.image) {
        infoImage.src = restaurant.image;
        infoImage.style.display = 'block';
    } else {
        infoImage.style.display = 'none';
    }

    // 设置基本信息
    document.getElementById('infoName').textContent = restaurant.name;
    document.getElementById('infoPrice').textContent = restaurant.price;
    document.getElementById('infoAddress').textContent = restaurant.address;

    // 设置菜品列表
    const dishesList = document.getElementById('infoDishes');
    dishesList.innerHTML = '';
    restaurant.dishes.forEach(dish => {
        const dishItem = document.createElement('span');
        dishItem.className = 'dish-item';
        dishItem.textContent = dish;
        dishesList.appendChild(dishItem);
    });

    // 存储当前餐厅信息，供"查看更多"使用
    document.getElementById('viewMoreBtn').onclick = () => {
        showDetailModal(restaurant);
    };

    infoCard.classList.add('active');
}

// 显示详细信息弹窗
function showDetailModal(restaurant) {
    const modal = document.getElementById('detailModal');
    
    document.getElementById('detailName').textContent = restaurant.name;
    document.getElementById('detailAddress').textContent = restaurant.address;
    document.getElementById('detailPrice').textContent = restaurant.price;

    // 设置图片
    const detailImage = document.getElementById('detailImage');
    if (restaurant.image) {
        detailImage.src = restaurant.image;
        detailImage.style.display = 'block';
    } else {
        detailImage.style.display = 'none';
    }

    // 设置菜品
    const detailDishes = document.getElementById('detailDishes');
    detailDishes.innerHTML = '';
    restaurant.dishes.forEach(dish => {
        const dishItem = document.createElement('span');
        dishItem.className = 'dish-item';
        dishItem.textContent = dish;
        detailDishes.appendChild(dishItem);
    });

    // 设置菜单
    const menuSection = document.getElementById('detailMenuSection');
    const menuText = document.getElementById('detailMenu');
    const menuImagesContainer = document.getElementById('detailMenuImages');
    
    if (restaurant.menu || (restaurant.menuImages && restaurant.menuImages.length > 0)) {
        menuSection.style.display = 'block';
        
        // 显示文字菜单
        if (restaurant.menu) {
            menuText.textContent = restaurant.menu;
            menuText.style.display = 'block';
        } else {
            menuText.style.display = 'none';
        }
        
        // 显示菜单图片
        menuImagesContainer.innerHTML = '';
        if (restaurant.menuImages && restaurant.menuImages.length > 0) {
            restaurant.menuImages.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'menu-image';
                img.alt = '菜单图片';
                img.onclick = () => {
                    // 点击图片放大查看
                    window.open(imageUrl, '_blank');
                };
                menuImagesContainer.appendChild(img);
            });
        }
    } else {
        menuSection.style.display = 'none';
    }

    // 设置小红书链接
    const xhsSection = document.getElementById('detailXhsSection');
    if (restaurant.xhsLink) {
        document.getElementById('detailXhsLink').href = restaurant.xhsLink;
        xhsSection.style.display = 'block';
    } else {
        xhsSection.style.display = 'none';
    }

    modal.classList.add('active');
}

// 地址搜索功能（使用 Nominatim 地理编码服务）
async function searchAddress(address) {
    try {
        // 添加"上海"确保搜索准确性
        const searchQuery = address.includes('上海') ? address : `上海 ${address}`;
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
        );
        const results = await response.json();
        
        if (results.length > 0) {
            const location = results[0];
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);
            
            // 移动地图到该位置
            map.setView([lat, lng], 16);
            
            // 添加临时标记
            const tempMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'temp-marker',
                    html: '📍',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                })
            }).addTo(map);
            
            // 3秒后移除
            setTimeout(() => map.removeLayer(tempMarker), 3000);
        } else {
            alert('未找到该地址，请检查地址是否正确');
        }
    } catch (error) {
        console.error('搜索错误:', error);
        alert('搜索失败，请检查网络连接');
    }
}

// 编辑模式
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editToolbar = document.getElementById('editToolbar');
    const editModeBtn = document.getElementById('editModeBtn');
    
    if (isEditMode) {
        editToolbar.classList.add('active');
        editModeBtn.textContent = '查看模式';
        editModeBtn.style.background = '#666';
    } else {
        editToolbar.classList.remove('active');
        editModeBtn.textContent = '编辑模式';
        editModeBtn.style.background = '';
    }

    // 重新加载标记以更新样式
    loadRestaurants();
}

// 打开编辑弹窗
function openEditModal(restaurant = null) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');
    const title = document.getElementById('editModalTitle');
    
    currentEditRestaurant = restaurant;
    
    // 重置文件选择
    selectedImageFile = null;
    selectedMenuImageFiles = [];
    document.getElementById('imageFileName').textContent = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('menuImagesPreview').innerHTML = '';
    
    if (restaurant) {
        // 编辑模式
        title.textContent = '编辑餐厅';
        document.getElementById('editName').value = restaurant.name;
        document.getElementById('editAddress').value = restaurant.address;
        document.getElementById('editLat').value = restaurant.lat;
        document.getElementById('editLng').value = restaurant.lng;
        document.getElementById('editPrice').value = restaurant.price;
        document.getElementById('editDishes').value = restaurant.dishes.join('\n');
        document.getElementById('editMenu').value = restaurant.menu || '';
        document.getElementById('editXhsLink').value = restaurant.xhsLink || '';
        document.getElementById('locationStatus').textContent = '已定位 ✓';
        
        // 显示现有图片
        if (restaurant.image) {
            const preview = document.getElementById('imagePreview');
            preview.src = restaurant.image;
            preview.style.display = 'block';
            document.getElementById('imageFileName').textContent = '当前已有图片';
        }
        
        // 显示现有菜单图片
        if (restaurant.menuImages && restaurant.menuImages.length > 0) {
            const previewContainer = document.getElementById('menuImagesPreview');
            restaurant.menuImages.forEach((imgSrc, index) => {
                const img = document.createElement('img');
                img.src = imgSrc;
                previewContainer.appendChild(img);
            });
        }
    } else {
        // 新增模式
        title.textContent = '添加餐厅';
        form.reset();
        document.getElementById('locationStatus').textContent = '';
    }
    
    modal.classList.add('active');
}

// 地址定位 - 使用百度地图API
async function locateAddress() {
    const address = document.getElementById('editAddress').value.trim();
    if (!address) {
        alert('请先输入地址');
        return;
    }

    document.getElementById('locationStatus').textContent = '定位中...';

    try {
        // 使用百度地图地理编码API
        let searchAddress = address;
        if (!address.includes('上海')) {
            searchAddress = '上海市' + address;
        }
        
        // 百度地图地理编码API
        const baiduUrl = `https://api.map.baidu.com/geocoding/v3/?address=${encodeURIComponent(searchAddress)}&output=json&ak=E4805d16520de693a3fe707cdc962045`;
        
        const response = await fetch(baiduUrl);
        const data = await response.json();
        
        if (data.status === 0 && data.result && data.result.location) {
            // 百度地图坐标是BD09，需要转换为WGS84（OpenStreetMap使用的坐标系）
            const bdLat = data.result.location.lat;
            const bdLng = data.result.location.lng;
            
            // 百度坐标转WGS84坐标
            const wgs = bd09toWgs84(bdLng, bdLat);
            
            document.getElementById('editLat').value = wgs.lat.toFixed(6);
            document.getElementById('editLng').value = wgs.lng.toFixed(6);
            document.getElementById('locationStatus').textContent = '定位成功 ✓';
            
            // 在地图上显示位置
            map.setView([wgs.lat, wgs.lng], 16);
            
            // 添加临时标记
            if (mapPickMarker) {
                map.removeLayer(mapPickMarker);
            }
            mapPickMarker = L.marker([wgs.lat, wgs.lng], {
                icon: L.divIcon({
                    className: 'temp-marker',
                    html: '📍',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                })
            }).addTo(map);
            
            alert(`✅ 定位成功！\n找到位置：${data.result.formatted_address || searchAddress}`);
        } else {
            throw new Error('未找到该地址');
        }
    } catch (error) {
        console.error('定位错误:', error);
        document.getElementById('locationStatus').textContent = '定位失败';
        alert('❌ 定位失败\n\n可能原因：\n1. 地址不够详细\n2. 网络连接问题\n\n请尝试：\n1. 输入更完整的地址（如：黄浦区南京东路100号）\n2. 或使用"🗺️ 地图选点"功能');
    }
}

// 百度坐标系(BD-09)转WGS84坐标系
function bd09toWgs84(bdLng, bdLat) {
    const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    const PI = 3.1415926535897932384626;
    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    
    const x = bdLng - 0.0065;
    const y = bdLat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
    const gcjLng = z * Math.cos(theta);
    const gcjLat = z * Math.sin(theta);
    
    // GCJ02转WGS84
    let dLat = transformLat(gcjLng - 105.0, gcjLat - 35.0);
    let dLng = transformLng(gcjLng - 105.0, gcjLat - 35.0);
    const radLat = gcjLat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
    const wgsLat = gcjLat - dLat;
    const wgsLng = gcjLng - dLng;
    
    return { lat: wgsLat, lng: wgsLng };
}

function transformLat(lng, lat) {
    const PI = 3.1415926535897932384626;
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLng(lng, lat) {
    const PI = 3.1415926535897932384626;
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

// 保存餐厅
async function saveRestaurant(e) {
    e.preventDefault();
    
    const lat = document.getElementById('editLat').value;
    const lng = document.getElementById('editLng').value;
    
    if (!lat || !lng) {
        alert('请先选择位置！\n\n可以：\n1. 点击"自动定位"按钮\n2. 点击"地图选点"按钮在地图上选择');
        return;
    }

    const dishes = document.getElementById('editDishes').value
        .split('\n')
        .map(d => d.trim())
        .filter(d => d);
    
    // 处理图片：转换为Base64
    let imageBase64 = currentEditRestaurant?.image || '';
    if (selectedImageFile) {
        imageBase64 = await fileToBase64(selectedImageFile);
    }
    
    // 处理菜单图片
    let menuImagesBase64 = currentEditRestaurant?.menuImages || [];
    if (selectedMenuImageFiles.length > 0) {
        menuImagesBase64 = await Promise.all(
            selectedMenuImageFiles.map(file => fileToBase64(file))
        );
    }

    const restaurantData = {
        name: document.getElementById('editName').value.trim(),
        address: document.getElementById('editAddress').value.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        price: document.getElementById('editPrice').value.trim(),
        dishes: dishes,
        image: imageBase64,
        menu: document.getElementById('editMenu').value.trim(),
        menuImages: menuImagesBase64,
        xhsLink: document.getElementById('editXhsLink').value.trim()
    };

    if (currentEditRestaurant) {
        // 更新
        store.update(currentEditRestaurant.id, restaurantData);
    } else {
        // 新增
        store.add(restaurantData);
    }

    // 重新加载地图标记
    loadRestaurants();
    
    // 清理临时标记
    if (mapPickMarker) {
        map.removeLayer(mapPickMarker);
        mapPickMarker = null;
    }
    
    // 关闭弹窗
    document.getElementById('editModal').classList.remove('active');
    
    alert(currentEditRestaurant ? '更新成功！' : '添加成功！');
}

// DOM 事件绑定
document.addEventListener('DOMContentLoaded', () => {
    // 初始化地图
    initMap();

    // 搜索按钮
    document.getElementById('searchBtn').addEventListener('click', () => {
        document.getElementById('searchPanel').classList.add('active');
        document.getElementById('searchInput').focus();
    });

    // 搜索提交
    document.getElementById('searchSubmit').addEventListener('click', () => {
        const address = document.getElementById('searchInput').value.trim();
        if (address) {
            searchAddress(address);
            document.getElementById('searchPanel').classList.remove('active');
        }
    });

    // 搜索回车
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('searchSubmit').click();
        }
    });

    // 关闭搜索
    document.getElementById('searchClose').addEventListener('click', () => {
        document.getElementById('searchPanel').classList.remove('active');
    });

    // 关闭信息卡片
    document.getElementById('closeInfoCard').addEventListener('click', () => {
        document.getElementById('infoCard').classList.remove('active');
    });

    // 关闭详细弹窗
    document.getElementById('closeDetailModal').addEventListener('click', () => {
        document.getElementById('detailModal').classList.remove('active');
    });

    // 编辑模式切换
    document.getElementById('editModeBtn').addEventListener('click', toggleEditMode);
    document.getElementById('exitEditModeBtn').addEventListener('click', toggleEditMode);

    // 添加餐厅
    document.getElementById('addRestaurantBtn').addEventListener('click', () => {
        openEditModal();
    });

    // 地址定位
    document.getElementById('locateBtn').addEventListener('click', locateAddress);
    
    // 地图选点
    document.getElementById('mapPickBtn').addEventListener('click', startMapPick);
    
    // 图片选择
    document.getElementById('selectImageBtn').addEventListener('click', () => {
        document.getElementById('editImageFile').click();
    });
    
    document.getElementById('editImageFile').addEventListener('change', handleImageSelect);
    
    // 菜单图片选择
    document.getElementById('selectMenuImagesBtn').addEventListener('click', () => {
        document.getElementById('editMenuImagesFile').click();
    });
    
    document.getElementById('editMenuImagesFile').addEventListener('change', handleMenuImagesSelect);

    // 保存表单
    document.getElementById('editForm').addEventListener('submit', saveRestaurant);

    // 取消编辑
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('active');
    });

    // 关闭编辑弹窗
    document.getElementById('closeEditModal').addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('active');
    });

    // 点击弹窗背景关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});
