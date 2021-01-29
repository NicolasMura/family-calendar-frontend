import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';


@Component({
  selector: 'app-help',
  template: `
    <!-- <p *ngFor="let content of fillerContent">
        {{ content }}
    </p> -->
    <div style="display: flex; flex-direction: column; align-items: center;">
      <button mat-flat-button color="primary" aria-label="submit"
              (click)=getName()
              [disabled]="submitLoadingSpinner"
              [class.mc-spinner]="submitLoadingSpinner"
              class="submit">
        Un prénom féminin au hasard :)
      </button>
      <p>Records count: {{ nhits }}</p>
      <p style="text-align: center; margin-top: 50px; font-size: 30px; color: deeppink;">{{ randomName }}</p>
      <p style="color: red; text-align: center;">{{ error }}</p>
    </div>
  `,
  // styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  fillerContent = Array.from({length: 3}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);
  /**
   * @TODO
   */
  nhits: number = null as any;
  /**
   * @TODO
   */
  randomName = '';
  /**
   * Boolean that allows to display a loading spinner on getName submit button
   */
  public submitLoadingSpinner = false;
  /**
   * Error management
   */
  public error = '';

  constructor(
    private http: HttpClient
  ) { }

  async getName(): Promise<void> {
    this.submitLoadingSpinner = true;
    this.nhits = await this.getRecordsCountFemale();

    const maxRandomNumber = this.nhits < 10000 ? this.nhits : 9999;
    const randomNumber = Math.floor(Math.random() * maxRandomNumber);

    this.randomName = await this.getRandomNameFemale(randomNumber);
    this.submitLoadingSpinner = false;
  }

  getRecordsCountFemale(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http.get<any>('https://opendata.paris.fr/api/records/1.0/search/?dataset=liste_des_prenoms&q=&rows=0&refine.sexe=F')
        .subscribe((response: any) => {
          console.log(response);
          resolve(response.nhits);
        }, error => {
          console.error(error);
          reject();
        });
    });
  }

  getRandomNameFemale(randomNumber: number): Promise<string> {
    return new Promise((resolve, reject) => {
      // const url = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=liste_des_prenoms&q=annee%3E%3D%222014-01-01%22&lang=fr&rows=10&start=0&sort=prenoms&facet=sexe&facet=annee&facet=prenoms';
      const url = `https://opendata.paris.fr/api/records/1.0/search/?dataset=liste_des_prenoms&q=&rows=1&start=${randomNumber}&refine.sexe=F`;
      this.http.get<any>(url)
        .subscribe((response: any) => {
          console.log(response);
          resolve(response.records[0].fields.prenoms);
        }, error => {
          console.error(error);
          reject();
        });
    });
  }
}
