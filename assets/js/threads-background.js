// Threads Background using OGL
// Converted from React Bits Threads component to Vanilla JS

class ThreadsBackground {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      color: options.color || [1, 1, 1],
      amplitude: options.amplitude !== undefined ? options.amplitude : 1,
      distance: options.distance !== undefined ? options.distance : 0,
      enableMouseInteraction: options.enableMouseInteraction !== undefined ? options.enableMouseInteraction : false
    };

    this.animationFrameId = null;
    this.currentMouse = [0.5, 0.5];
    this.targetMouse = [0.5, 0.5];
    this.isVisible = true;

    this.init();
  }

  init() {
    if (typeof OGL === 'undefined') {
      console.error('OGL library not loaded');
      return;
    }

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec3 uColor;
      uniform float uAmplitude;
      uniform float uDistance;
      uniform vec2 uMouse;

      #define PI 3.1415926538

      const int u_line_count = 40;
      const float u_line_width = 7.0;
      const float u_line_blur = 10.0;

      float Perlin2D(vec2 P) {
          vec2 Pi = floor(P);
          vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
          vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
          Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
          Pt += vec2(26.0, 161.0).xyxy;
          Pt *= Pt;
          Pt = Pt.xzxz * Pt.yyww;
          vec4 hash_x = fract(Pt * (1.0 / 951.135664));
          vec4 hash_y = fract(Pt * (1.0 / 642.949883));
          vec4 grad_x = hash_x - 0.49999;
          vec4 grad_y = hash_y - 0.49999;
          vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
              * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
          grad_results *= 1.4142135623730950;
          vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
                     * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
          vec4 blend2 = vec4(blend, vec2(1.0 - blend));
          return dot(grad_results, blend2.zxzx * blend2.wwyy);
      }

      float pixel(float count, vec2 resolution) {
          return (1.0 / max(resolution.x, resolution.y)) * count;
      }

      float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
          float split_offset = (perc * 0.4);
          float split_point = 0.1 + split_offset;

          float amplitude_normal = smoothstep(split_point, 0.7, st.x);
          float amplitude_strength = 0.5;
          float finalAmplitude = amplitude_normal * amplitude_strength
                                 * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

          float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
          float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

          float xnoise = mix(
              Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
              Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
              st.x * 0.3
          );

          float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

          float line_start = smoothstep(
              y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
              y,
              st.y
          );

          float line_end = smoothstep(
              y,
              y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
              st.y
          );

          return clamp(
              (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
              0.0,
              1.0
          );
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 uv = fragCoord / iResolution.xy;

          float line_strength = 1.0;
          for (int i = 0; i < u_line_count; i++) {
              float p = float(i) / float(u_line_count);
              line_strength *= (1.0 - lineFn(
                  uv,
                  u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
                  p,
                  (PI * 1.0) * p,
                  uMouse,
                  iTime,
                  uAmplitude,
                  uDistance
              ));
          }

          float colorVal = 1.0 - line_strength;
          fragColor = vec4(uColor * colorVal, colorVal);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    this.renderer = new OGL.Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.container.appendChild(this.gl.canvas);

    const geometry = new OGL.Triangle(this.gl);
    this.program = new OGL.Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new OGL.Color(
            this.gl.canvas.width,
            this.gl.canvas.height,
            this.gl.canvas.width / this.gl.canvas.height
          )
        },
        uColor: { value: new OGL.Color(...this.options.color) },
        uAmplitude: { value: this.options.amplitude },
        uDistance: { value: this.options.distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      }
    });

    this.mesh = new OGL.Mesh(this.gl, { geometry, program: this.program });

    this.resizeHandler = this.resize.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    this.resizeObserver = new ResizeObserver(this.resizeHandler);
    this.resizeObserver.observe(this.container);

    this.resize();

    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseLeave = this.onMouseLeave.bind(this);
    this.container.addEventListener('mousemove', this.handleMouseMove);
    this.container.addEventListener('mouseleave', this.handleMouseLeave);

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        this.isVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    this.intersectionObserver.observe(this.container);

    this.update(0);
  }

  resize() {
    if (!this.container) return;
    const { clientWidth, clientHeight } = this.container;
    const MAX_RENDER_DIM = 1920;
    const baseDpr = Math.min(window.devicePixelRatio || 1, 2);
    const longestSide = Math.max(clientWidth, clientHeight) * baseDpr;
    const dpr = longestSide > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longestSide : baseDpr;
    this.renderer.dpr = dpr;
    this.renderer.setSize(clientWidth, clientHeight);
    this.program.uniforms.iResolution.value.r = this.gl.canvas.width;
    this.program.uniforms.iResolution.value.g = this.gl.canvas.height;
    this.program.uniforms.iResolution.value.b = this.gl.canvas.width / this.gl.canvas.height;
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    this.targetMouse = [x, y];
  }

  onMouseLeave() {
    this.targetMouse = [0.5, 0.5];
  }

  update(t) {
    this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    if (!this.isVisible || document.hidden) return;

    this.program.uniforms.uColor.value.set(...this.options.color);
    this.program.uniforms.uAmplitude.value = this.options.amplitude;
    this.program.uniforms.uDistance.value = this.options.distance;

    if (this.options.enableMouseInteraction) {
      const smoothing = 0.05;
      this.currentMouse[0] += smoothing * (this.targetMouse[0] - this.currentMouse[0]);
      this.currentMouse[1] += smoothing * (this.targetMouse[1] - this.currentMouse[1]);
      this.program.uniforms.uMouse.value[0] = this.currentMouse[0];
      this.program.uniforms.uMouse.value[1] = this.currentMouse[1];
    } else {
      this.program.uniforms.uMouse.value[0] = 0.5;
      this.program.uniforms.uMouse.value[1] = 0.5;
    }
    this.program.uniforms.iTime.value = t * 0.001;

    this.renderer.render({ scene: this.mesh });
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    window.removeEventListener('resize', this.resizeHandler);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    if (this.gl.canvas && this.gl.canvas.parentNode) {
      this.container.removeChild(this.gl.canvas);
    }
    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const threadsContainer = document.querySelector('.ai-section-wrapper .threads-container');
  if (threadsContainer) {
    console.log('Initializing Threads background...');
    try {
      new ThreadsBackground(threadsContainer, {
        color: [1, 1, 1],
        amplitude: 1,
        distance: 0,
        enableMouseInteraction: true
      });
      console.log('Threads background initialized successfully');
    } catch (error) {
      console.error('Error initializing Threads background:', error);
    }
  } else {
    console.warn('Threads container not found');
  }
});
