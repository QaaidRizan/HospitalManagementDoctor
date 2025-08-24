import { Component } from '@angular/core';

@Component({
  selector: 'app-public-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class PublicFooterComponent {
  currentYear: number = new Date().getFullYear();
}


