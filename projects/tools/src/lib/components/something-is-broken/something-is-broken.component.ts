import { Component, Input, OnInit } from '@angular/core';
import { UtilitiesService } from 'projects/tools/src/lib/services/utilities.service';
import { fadeInOutAnimation } from 'projects/tools/src/lib/animations/fade-in-out.animation';


@Component({
  selector: 'lib-something-is-broken',
  templateUrl: './something-is-broken.component.html',
  styleUrls: ['./something-is-broken.component.scss'],
  animations: [fadeInOutAnimation]
})
export class SomethingIsBrokenComponent implements OnInit {
  @Input() statusCode = '404';
  @Input() statusMessage = '';

  constructor(
    public utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
  }

}
