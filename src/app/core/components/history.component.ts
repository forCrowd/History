import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { Project, ProjectService, Element, ElementField, ElementCell, AuthService } from "@forcrowd/backbone-client-core";
import { Subscription } from 'rxjs';

@Component({
  selector: "history",
  templateUrl: "history.component.html",
  styleUrls: ["history.component.css"],
})
export class HistoryComponent implements OnInit, OnDestroy {

  project: Project = null;
  selectedTab = new FormControl(0);
  selectedTimeline: number = 0;
  username: string = null;
  timeline: string = null;
  isBusy: boolean;

  subscriptions: Subscription[] = [];

  get currentUser() {
    return this.authService.currentUser;
  }


  get selectedElement(): Element {
    return this.fields.selectedElement;
  }
  set selectedElement(value: Element) {
    if (this.fields.selectedElement !== value) {
      this.fields.selectedElement = value;
    }
  }

  get selectedElementField(): ElementField {
    return this.fields.selectedElementField;
  }
  set selectedElementField(value: ElementField) {
    if (this.fields.selectedElementField !== value) {
      this.fields.selectedElementField = value;
    }
  }

  get selectedElementCellSet(): ElementCell[] {
    return this.fields.selectedElementCellSet;
  }
  set selectedElementCellSet(value: ElementCell[]) {
    if (this.fields.selectedElementCellSet !== value) {
      this.fields.selectedElementCellSet = value;
    }
  }

  get selectedElementCell(): ElementCell {
    return this.fields.selectedCell;
  }
  set selectedElementCell(value: ElementCell) {
    if (this.fields.selectedCell !== value) {
      this.fields.selectedCell = value;
    }
  }

  get selectedElementLikeCountSet(): ElementCell[] {
    return this.fields.selectedElementLikeCountSet;
  }
  set selectedElementLikeCountSet(value: ElementCell[]) {
    if (this.fields.selectedElementLikeCountSet !== value) {
      this.fields.selectedElementLikeCountSet = value;
    }
  }

  private fields: {
    selectedElement: Element,
    selectedElementField: ElementField,
    selectedElementCellSet: ElementCell[],
    selectedCell: ElementCell,
    selectedElementLikeCountSet: ElementCell[]
  } = {
      selectedElement: null,
      selectedElementField: null,
      selectedElementCellSet: null,
      selectedCell: null,
      selectedElementLikeCountSet: null
    }

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService) {
      if (activatedRoute.firstChild !== null) {
        var activatedRouteSubscription =  activatedRoute.firstChild.paramMap.subscribe((params: ParamMap) : void => {
          this.timeline = params.get( "timeline" );
          if (this.project !== null) this.loadProject(this.project.Id);
        });
        this.subscriptions.push(activatedRouteSubscription);
      }
  }

  decimalValueTotal(index: number): number {
    var valueTotal = 0;
    const userElementCellSet = this.selectedElement.ElementFieldSet[1].ElementCellSet[index];
    userElementCellSet.UserElementCellSet.forEach((cell)=> valueTotal += cell.DecimalValue);
    return valueTotal;
  }

  changeLikeCount(value: number, index: number): void {
    const userElementCellSet = this.selectedElement.ElementFieldSet[1].ElementCellSet[index];

    if (userElementCellSet.UserElementCellSet.length > 0) {
      var currentDecimalValue = userElementCellSet.UserElementCellSet[0].DecimalValue;
      if (currentDecimalValue === 0 || currentDecimalValue !== value) {
        userElementCellSet.UserElementCellSet[0].DecimalValue += value;
      }
    } else {
      this.projectService.createUserElementCell(userElementCellSet, value);
    }

    this.projectService.saveChanges().subscribe();
  }

  // Set selected timeline element
  selectTimeline(value: number): void {
    this.selectedTimeline = value;
    this.selectedElement = this.project.ElementSet[value];
    this.selectedElementField = this.selectedElement.ElementFieldSet[0];
    this.selectedElementLikeCountSet = this.selectedElement.ElementFieldSet[1].ElementCellSet; // for Like - Dislike
    this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];
    this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
  }

  loadProject(projectId: number) {
    this.projectService.getProjectExpanded<Project>(projectId)
      .subscribe(project => {

        if (!project) {
          return;
        }

        // Project History
        this.project = project;

        if (this.timeline !== null) {
          for (var i = 0; i < this.project.ElementSet.length; i++) {
            if (this.timeline === this.project.ElementSet[i].Name) {
              this.selectTimeline(i);
              return;
            }
          }
        } else {
          this.selectedElement = this.project.ElementSet[this.selectedTimeline];
        }

        this.selectedElementField = this.selectedElement.ElementFieldSet[0];
        this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];
        this.selectedElementLikeCountSet = this.selectedElement.ElementFieldSet[1].ElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
        this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
      });
  }

  ngOnInit(): void {
    if (this.currentUser.isAuthenticated !== null) this.authService.ensureAuthenticatedUser().subscribe();

    this.username = this.activatedRoute.snapshot.params["username"];

    this.projectService.getProjectSet<Project>(this.username)
      .subscribe(projectSet => {

        for (var i = 0; i < projectSet.length; i++) {
          var project = projectSet[i];

          if (project.Name === "History App") {
            // Project History
            this.project = project;
            this.loadProject(this.project.Id);
            return;
          }

        };
      });
  }

  ngOnDestroy(): void {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

}
