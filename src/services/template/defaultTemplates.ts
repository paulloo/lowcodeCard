import type { Template } from '../../types/template';

export const defaultTemplates: Template[] = [
  {
    id: 'template_classic',
    name: '经典模板',
    type: 'builtin',
    description: '简约优雅的经典布局',
    thumbnail: '/templates/classic/thumbnail.png',
    fields: [],
    variables: {
      images: {
        self: '',
        partner: '',
        background: ''
      },
      message: '',
      styles: {
        colors: ['#FF69B4', '#FFB6C1'],
        effects: []
      }
    },
    html: `
      <div class="card-container">
        <div class="background">
          {{#if images.background}}
            <img src="{{images.background}}" alt="背景" />
          {{/if}}
        </div>
        
        <div class="photos">
          <div class="photo self">
            {{#if images.self}}
              <img src="{{images.self}}" alt="自己" />
            {{else}}
              <div class="placeholder">点击上传照片</div>
            {{/if}}
          </div>
          
          <div class="photo partner">
            {{#if images.partner}}
              <img src="{{images.partner}}" alt="对方" />
            {{else}}
              <div class="placeholder">点击上传照片</div>
            {{/if}}
          </div>
        </div>
        
        <div class="message">
          {{#if message}}
            <p>{{message}}</p>
          {{else}}
            <p class="placeholder">写下你的祝福...</p>
          {{/if}}
        </div>
      </div>
    `,
    css: `
      .card-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 16px;
        background: linear-gradient(135deg, {{styles.colors.[0]}}, {{styles.colors.[1]}});
      }

      .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .background img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.3;
      }

      .photos {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 2rem;
        position: relative;
        z-index: 1;
      }

      .photo {
        width: 40%;
        aspect-ratio: 1;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        background: rgba(255,255,255,0.9);
      }

      .photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .message {
        position: relative;
        z-index: 1;
        padding: 2rem;
        text-align: center;
        font-size: 1.25rem;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: #666;
        font-size: 0.875rem;
      }
    `,
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'template_modern',
    name: '现代模板',
    type: 'builtin',
    thumbnail: '/templates/modern/thumbnail.png',
    variables: {
      images: {
        self: '',
        partner: '',
        background: ''
      },
      message: '',
      styles: {
        colors: ['#FF1493', '#FF69B4'],
        effects: []
      }
    },
    html: `
      <div class="card-modern">
        <div class="photos-grid">
          <div class="photo-wrapper self">
            {{#if images.self}}
              <img src="{{images.self}}" alt="自己" />
            {{else}}
              <div class="upload-hint">上传照片</div>
            {{/if}}
          </div>
          
          <div class="photo-wrapper partner">
            {{#if images.partner}}
              <img src="{{images.partner}}" alt="对方" />
            {{else}}
              <div class="upload-hint">上传照片</div>
            {{/if}}
          </div>
        </div>
        
        <div class="message-box">
          {{#if message}}
            <p>{{message}}</p>
          {{else}}
            <p class="hint">写下你的祝福...</p>
          {{/if}}
        </div>
      </div>
    `,
    css: `
      .card-modern {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 2rem;
        background: linear-gradient(45deg, {{styles.colors.[0]}}, {{styles.colors.[1]}});
        border-radius: 24px;
      }

      .photos-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .photo-wrapper {
        position: relative;
        aspect-ratio: 1;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        background: rgba(255,255,255,0.9);
        transition: transform 0.3s ease;
      }

      .photo-wrapper:hover {
        transform: translateY(-4px);
      }

      .photo-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .message-box {
        background: rgba(255,255,255,0.95);
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      }

      .message-box p {
        margin: 0;
        font-size: 1.25rem;
        color: #333;
        line-height: 1.6;
      }

      .upload-hint,
      .hint {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-size: 0.875rem;
      }
    `
  }
]; 