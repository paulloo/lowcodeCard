// 布局组件预设模板
export const LayoutTemplates = {
  // 照片墙组件
  PhotoWall: {
    label: '照片墙',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    fields: [
      {
        id: 'photos',
        type: 'image',
        label: '照片',
        required: true,
        path: 'gallery.photos',
        showLabel: false,
        options: {
          multiple: true,
          format: 'jpg,jpeg,png,gif',
          maxSize: 5 * 1024 * 1024,
          aspectRatio: '1/1',
          objectFit: 'cover'
        }
      }
    ],
    html: `
<div class="photo-wall">
  {{#each gallery.photos}}
    <div class="photo">
      <img src="{{this}}" alt="">
    </div>
  {{/each}}
</div>`,
    css: `
.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.photo {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo:hover img {
  transform: scale(1.1);
}`
  },

  // 特色卡片组件
  FeatureCard: {
    label: '特色卡片',
    icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    fields: [
      {
        id: 'image',
        type: 'image',
        label: '卡片图片',
        required: true,
        path: 'card.image',
        showLabel: false,
        options: {
          format: 'jpg,jpeg,png,gif',
          maxSize: 5 * 1024 * 1024,
          aspectRatio: '16/9',
          objectFit: 'cover'
        }
      },
      {
        id: 'title',
        type: 'text',
        label: '标题',
        path: 'card.title',
        showLabel: false,
        defaultValue: '卡片标题',
        style: {
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#1a1a1a'
        }
      },
      {
        id: 'description',
        type: 'text',
        label: '描述',
        path: 'card.description',
        showLabel: false,
        defaultValue: '卡片描述内容',
        style: {
          fontSize: '1rem',
          color: '#4a4a4a'
        },
        options: {
          rows: 3
        }
      }
    ],
    html: `
<div class="feature-card">
  <div class="card-image">
    <img src="{{card.image}}" alt="">
  </div>
  <div class="card-content">
    <div class="card-title">{{card.title}}</div>
    <div class="card-description">{{card.description}}</div>
  </div>
</div>`,
    css: `
.feature-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px -1px rgba(0,0,0,0.15);
}

.card-image {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.feature-card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 1rem;
  color: #4a4a4a;
  line-height: 1.6;
}`
  }
}; 