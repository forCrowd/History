import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material";
import { Project, AuthService, ProjectService, Element, ElementItem, ElementField, ElementCell, NotificationService, User } from "@forcrowd/backbone-client-core";
import { Subscription } from "rxjs";
import { finalize, flatMap, map } from "rxjs/operators";

import { RemoveHistoryConfirmComponent } from "./remove-history.component";

import { AppProjectService } from "../app-core.module";

@Component({
  selector: "timeline",
  templateUrl: "timeline.component.html",
  styleUrls: ["timeline.component.css"]
})
export class TimelineComponent implements OnInit {
  activeUser: User = null;
  activeTimeline: Element = null;
  activeProject: Project = null;
  entry = "";
  isBusy: boolean;
  changeElementName = false;

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
    selectedElement: Element;
    selectedElementField: ElementField;
    selectedElementCellSet: ElementCell[];
    selectedCell: ElementCell;
    selectedElementLikeCountSet: ElementCell[];
  } = {
    selectedElement: null,
    selectedElementField: null,
    selectedElementCellSet: null,
    selectedCell: null,
    selectedElementLikeCountSet: null
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private readonly router: Router
  ) {}

  cancelEditing() {
    this.entry = "";
    this.selectedElementCell = null;
    this.isBusy = false;
    this.changeElementName = false;
  }

  create() {
    this.entry = this.entry.trim();

    if (this.entry === "") {
      return;
    }

    const values = {
      Element: this.activeTimeline,
      Name: this.entry
    };

    this.projectService.createElementItem(values);

    this.isBusy = true;
    this.projectService.saveChanges().subscribe(
      () => {
        this.entry = "";
      },
      null,
      () => {
        this.isBusy = false;
      }
    );
  }

  // Create project (only one time)
  createProjectHistory(): void {
    this.isBusy = true;
    this.activeProject = (this.projectService as AppProjectService).createProjectHistory();

    this.projectService.saveChanges().subscribe(() => {
      this.loadProject(this.activeProject.Id);
      this.isBusy = false;
    });
  }

  // Create a new entry in timeline
  createHistroyContent() {
    this.isBusy = true;

    if (!this.changeElementName) {
      if (this.selectedElementCell === null) {
        // New Item
        const elementItem = this.projectService.createElementItem({
          Element: this.selectedElement,
          Name: `Entry ${this.selectedElement.ElementItemSet.length + 1}`
        }) as ElementItem;

        // Cell
        this.projectService.createElementCell({
          ElementField: this.selectedElementField,
          ElementItem: elementItem,
          StringValue: this.entry
        });

        // Item
        const likeItem = this.projectService.createElementItem({
          Element: this.selectedElement,
          Name: `likes ${this.selectedElement.ElementFieldSet[1].ElementCellSet.length + 1}`
        }) as ElementItem;

        // Cell
        const likeCell = this.projectService.createElementCell({
          ElementField: this.selectedElement.ElementFieldSet[1],
          ElementItem: likeItem
        });

        this.projectService.createUserElementCell(likeCell, 0);

        this.projectService.saveChanges().subscribe(() => {
          this.entry = "";
          this.loadProject(this.activeProject.Id);
          this.isBusy = false;
        });
      } else {
        this.selectedElementCell.StringValue !== this.entry ? this.change() : (this.isBusy = false);
      }
    } else {
      // if timeline name will be change then
      this.selectedElement.Name = this.entry;
      this.projectService
        .saveChanges()
        .pipe(
          finalize(() => {
            this.entry = "";
            this.isBusy = false;
          })
        )
        .subscribe();
      this.changeElementName = false;
    }
  }

  // Change timeline item value
  change(): void {
    this.selectedElementCell.StringValue = this.entry;
    this.projectService.saveChanges().subscribe(() => {
      this.notificationService.notification.next("Timeline item has been change");
      this.entry = "";
      this.selectedElementCell = null;
      this.loadProject(this.activeProject.Id);
      this.isBusy = false;
    });
  }

  // Edit Timeline Header (Chane element name)
  editTimelineHeader(element: Element): void {
    this.notificationService.notification.next("Please write new timeline name form to input then submit");
    this.changeElementName = true;
    this.entry = this.selectedElement.Name;
  }

  // Edit item
  edit(elementCell: ElementCell) {
    this.entry = elementCell.StringValue;
    this.selectedElementCell = elementCell;
  }

  // Set project element and field
  loadProject(projectId: number) {
    this.projectService.getProjectExpanded<Project>(projectId).subscribe(project => {
      if (!project) {
        return;
      }

      // Project History
      this.activeProject = project;

      const timelineName = this.activatedRoute.snapshot.params["timeline-name"];

      for (let i = 0; i < this.activeProject.ElementSet.length; i++) {
        if (timelineName === this.activeProject.ElementSet[i].Name) {
          this.selectTimeline(i);
          return;
        }
      }

      this.isBusy = false;
    });
  }

  decimalValueTotal(index: number): number {
    return this.selectedElement.ElementFieldSet[1].ElementCellSet[index].DecimalValueTotal;
  }

  changeLikeCount(value: number, index: number): void {
    const userElementCellSet = this.selectedElement.ElementFieldSet[1].ElementCellSet[index];

    userElementCellSet.UserElementCellSet.length > 0
      ? (userElementCellSet.UserElementCellSet[0].DecimalValue = value)
      : this.projectService.createUserElementCell(userElementCellSet, value);

    this.projectService.saveChanges().subscribe();
  }

  // Set selected timeline element
  selectTimeline(value: number): void {
    if (this.activeProject.ElementSet.length > 0) {
      this.selectedElement = this.activeProject.ElementSet[value];
      this.selectedElementField = this.selectedElement.ElementFieldSet[0];
      this.selectedElementLikeCountSet = this.selectedElement.ElementFieldSet[1].ElementCellSet; // for Like - Dislike
      this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];
      this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b) => b.CreatedOn.getTime() - a.CreatedOn.getTime());
    }
  }

  // Remove selected item
  removeHistoryItem(elementItem: ElementItem) {
    const dialogRef = this.dialog.open(RemoveHistoryConfirmComponent);

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      const likeItemIndex = this.selectedElement.ElementItemSet.indexOf(elementItem);

      this.projectService.removeElementItem(elementItem);
      this.projectService.removeElementItem(this.selectedElement.ElementItemSet[likeItemIndex]);

      this.projectService
        .saveChanges()
        .pipe(
          finalize(() => {
            this.entry = "";
            this.selectedElementCell = null;
            this.loadProject(this.activeProject.Id);
          })
        )
        .subscribe();
    });
  }

  ngOnInit(): void {
    const username = this.activatedRoute.snapshot.params["username"];
    const timelineId = Number(this.activatedRoute.snapshot.params["timeline-id"]);

    console.log("t", timelineId);

    this.authService
      .getUser(username)
      .pipe(
        flatMap(user => {
          // Not found, navigate to 404
          if (user === null) {
            const url = window.location.href.replace(window.location.origin, "");
            this.router.navigate(["/app/not-found", { url: url }]);
            return;
          }

          this.activeUser = user;

          console.log("u", user);

          this.activeProject = user.ProjectSet.find(e => e.Origin === "http://history.forcrowd.org");
          console.log("h", this.activeProject);

          if (this.activeProject === null) {
            const url = window.location.href.replace(window.location.origin, "");
            this.router.navigate(["/app/not-found", { url: url }]);
            return;
          }

          return this.projectService.getProjectExpanded(this.activeProject.Id).pipe(
            map(() => {
              const timeline = this.activeProject.ElementSet.find(e => e.Id === timelineId);

              if (timeline === null) {
                const url = window.location.href.replace(window.location.origin, "");
                this.router.navigate(["/app/not-found", { url: url }]);
                return;
              }

              this.activeTimeline = timeline;

              console.log("t", timeline);
            })
          );
        })
      )
      .subscribe();
  }
}
