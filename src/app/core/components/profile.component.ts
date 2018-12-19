import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Project, ProjectService, Element, ElementField, ElementCell } from "@forcrowd/backbone-client-core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "profile",
  templateUrl: "profile.component.html",
  styleUrls: ["profile.component.css"],
})
export class ProfileComponent implements OnInit {

  project: Project = null;
  selectedTab = new FormControl(0);
  selectedTimeline: number = 0;
  username: string = null;
  timeline: string = null;
  isBusy: boolean;

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

  constructor(private activatedRoute: ActivatedRoute,
    private projectService: ProjectService) {
  }

  changeLikeCount(value: number, index: number): void {
    this.isBusy = true;
    this.selectedElementLikeCountSet[index].UserElementCellSet[0].DecimalValue += value;
    this.projectService.saveChanges().subscribe(() => {
      this.isBusy = false;
    });
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

        if (this.timeline !== undefined) {
          for (var i = 0; i < this.project.ElementSet.length; i++) {
            if (this.timeline === this.project.ElementSet[i].Name) {
              this.selectTimeline(i);
              return;
            }
          }
        } else {
          this.timeline = null;
          this.selectedElement = this.project.ElementSet[this.selectedTimeline];
        }

        this.selectedElementField = this.selectedElement.ElementFieldSet[0];
        this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];
        this.selectedElementLikeCountSet = this.selectedElement.ElementFieldSet[1].ElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
        this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
      });
  }

  ngOnInit(): void {

    this.username = this.activatedRoute.snapshot.params["username"];
    this.timeline = this.activatedRoute.snapshot.params["timeline"];

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

}
