import { Component, Input } from '@angular/core';

let logoCounter = 0;

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg viewBox="0 0 100 100" [style.width.px]="size" [style.height.px]="size" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient [attr.id]="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5eead4" />
          <stop offset="55%" stop-color="#14b8a6" />
          <stop offset="100%" stop-color="#0f766e" />
        </linearGradient>
        <clipPath [attr.id]="clipId">
          <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" />
        </clipPath>
      </defs>
      <g [attr.clip-path]="'url(#' + clipId + ')'">
        <rect x="0" y="0" width="100" height="100" fill="#0f3d3a" />
        <polygon points="0,0 100,0 100,38 54,62 0,38" [attr.fill]="'url(#' + gradId + ')'" />
        <polygon points="54,62 100,38 100,100 28,100" fill="#0d3733" />
        <polygon points="30,46 56,32 56,45 78,45 56,59 56,72 30,59" fill="#ffffff" />
      </g>
    </svg>
  `
})
export class LogoComponent {
  @Input() size = 24;
  private id = ++logoCounter;
  gradId = `tr-logo-grad-${this.id}`;
  clipId = `tr-logo-clip-${this.id}`;
}
