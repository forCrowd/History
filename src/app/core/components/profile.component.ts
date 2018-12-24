import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { Project, AuthService, ProjectService, Element, ElementItem, ElementField, ElementCell, NotificationService, ElementFieldDataType } from "@forcrowd/backbone-client-core";
import { finalize } from "rxjs/operators";

// Component
import { RemoveHistoryConfirmComponent } from "./remove-history.component";
import { ConfirmEditComponent } from "./confirm-edit.component";

// Service
import { AppProjectService } from "../app-core.module";
import { ProfileRemoveProjectComponent } from './profile-remove-project.component';

@Component({
  selector: "profile",
  templateUrl: "profile.component.html",
  styleUrls: ["profile.component.css"],
})
export class ProfileComponent implements OnInit {

  entry: string = "";
  changeElementName: boolean = false;
  project: Project = null;
  isBusy: boolean;
  selectedTab = new FormControl(0);
  selectedTimeline: number = 0;

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

  constructor(private readonly authService: AuthService,
    private readonly projectService: ProjectService,
    private notificationService: NotificationService,
    private dialog: MatDialog) {
  }

  cancelEditing() {
    this.entry = "";
    this.selectedElementCell = null;
    this.isBusy = false;
    this.changeElementName = false;
  }

  // Create project (only one time)
  createProjectHistory(): void {
    this.isBusy = true;
    this.project = (this.projectService as AppProjectService).createProjectHistory();

    this.projectService.saveChanges().subscribe(() => {
        this.loadProject(this.project.Id);
        this.isBusy = false;
      });
  }

  // Create a new entry in timeline
  createHistroyContent(): void {

    if (!this.currentUser || !this.currentUser.isAuthenticated()) this.createProjectHistory();

    this.isBusy = true;

    if (!this.changeElementName) {
      if (this.selectedElementCell === null) {

        // New Item
        const elementItem = this.projectService.createElementItem({
          Element: this.selectedElement,
          Name: `Entry ${this.selectedElement.ElementItemSet.length + 1}`,
        }) as ElementItem;

        // Cell
        this.projectService.createElementCell({
          ElementField: this.selectedElementField,
          ElementItem: elementItem,
          StringValue: this.entry,
        });

        /* Like - Dislike */

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
          this.loadProject(this.project.Id);
          this.isBusy = false;
        });

      } else {
        this.selectedElementCell.StringValue !== this.entry ? this.change()
          : this.isBusy = false;
      }
    } else {
      // if timeline name will be change then
      this.selectedElement.Name = this.entry;
      this.projectService.saveChanges().subscribe(() => {
        this.entry = "";
        this.isBusy = false;
      });
      this.changeElementName = false;
    }

  }

  // Create a new History Timeline
  createNewHistroyTimeline(): void {

    // New Timeline Element
    const element = this.projectService.createElement({
      Project: this.project,
      Name: this.entry
    }) as Element;

    // Field
    const elementField = this.projectService.createElementField({
      Element: element,
      Name: this.entry,
      DataType: ElementFieldDataType.String,
      SortOrder: 1
    }) as ElementField;

    // Item
    const elementItem = this.projectService.createElementItem({
      Element: element,
      Name: this.entry
    }) as ElementItem;

    // Cell
    this.projectService.createElementCell({
      ElementField: elementField,
      ElementItem: elementItem,
      StringValue: "First",
    });

    /* --- */

    // Like Dislikes Count
    const elementField2 = this.projectService.createElementField({
      Element: element,
      Name: "likes",
      DataType: ElementFieldDataType.Decimal,
      UseFixedValue: false,
      RatingEnabled: false,
      SortOrder: 0
    }) as ElementField;

    // Item
    const elementItem2 = this.projectService.createElementItem({
      Element: element,
      Name: "likes"
    }) as ElementItem;

    // Cell
    const cell2 = this.projectService.createElementCell({
      ElementField: elementField2,
      ElementItem: elementItem2
    });

    this.projectService.createUserElementCell(cell2, 0);

    this.projectService.saveChanges().subscribe(() => {
      this.selectedTab.setValue(this.project.ElementSet.length + 1);
      this.entry = "";
      this.isBusy = false;
    });
  }

  // Change timeline item value
  change(): void {
    // change cell string value
    const dialogRef = this.dialog.open(ConfirmEditComponent);
    dialogRef.afterClosed().subscribe(confirmed => {

      if (!confirmed) {
        this.cancelEditing();
        return;
      }

      this.selectedElementCell.StringValue = this.entry;
      this.projectService.saveChanges().subscribe(() => {
        this.notificationService.notification.next("Timeline item has been change");
        this.entry = "";
        this.selectedElementCell = null;
        this.loadProject(this.project.Id);
        this.isBusy = false;
      });
    });

  }

  // Delete Timeline (history)
  deleteTimeline(element: Element): void {

    const dialogRef = this.dialog.open(ProfileRemoveProjectComponent);

    dialogRef.afterClosed().subscribe(confirmed => {

      if (!confirmed) {
        return;
      }

      this.projectService.removeElement(element);
      this.projectService.saveChanges().pipe(
        finalize(() => {
          if (this.project.ElementSet.length > 0) {
            this.selectTimeline(0);
            this.selectedTab.setValue(0);
          }
          this.notificationService.notification.next("Your timeline has been removed!");
        })).subscribe();
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
    this.projectService.getProjectExpanded<Project>(projectId)
      .subscribe(project => {

        if (!project) {
          return;
        }

        // Project History
        this.project = project;

        if (this.project.ElementSet.length > 0) {
          // Selected element
          this.selectedElement = this.project.ElementSet[this.selectedTimeline];

          // ElementField
          this.selectedElementField = this.selectedElement.ElementFieldSet[0];

          // for Like - Dislike
          // ElementLikeCountSet (ElementCellSet)
          this.selectedElementLikeCountSet = this.selectedElement.ElementFieldSet[1].ElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));

          // ElementCellSet
          this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];
          this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
        }

        this.isBusy = false;
      });
  }

  decimalValueTotal(index: number): number {
    return this.selectedElement.ElementFieldSet[1].ElementCellSet[index].DecimalValueTotal;
  }

  changeLikeCount(value: number, index: number): void {
    const userElementCellSet = this.selectedElement.ElementFieldSet[1].ElementCellSet[index];

    if (userElementCellSet.UserElementCellSet.length > 0) {
      userElementCellSet.UserElementCellSet[0].DecimalValue = value;
      this.projectService.saveChanges().subscribe();
    } else {
      this.projectService.createUserElementCell(userElementCellSet, value);
      this.projectService.saveChanges().subscribe();
    }
  }

  // Set selected timeline element
  selectTimeline(value: number): void {
    this.isBusy = true;
    if (this.project.ElementSet.length > 0) {
      this.selectedTimeline = value;
      this.selectedElement = this.project.ElementSet[value];
      this.selectedElementField = this.selectedElement.ElementFieldSet[0];
      this.selectedElementLikeCountSet = this.selectedElement.ElementFieldSet[1].ElementCellSet; // for Like - Dislike
      this.selectedElementCellSet = this.selectedElementField.ElementCellSet as ElementCell[];
      this.selectedElementCellSet = this.selectedElementCellSet.sort((a, b) => (b.CreatedOn.getTime() - a.CreatedOn.getTime()));
    }
    this.isBusy = false;
  }

  // Remove selected item
  removeHistoryItem(elementItem: ElementItem) {
    const dialogRef = this.dialog.open(RemoveHistoryConfirmComponent);

    dialogRef.afterClosed().subscribe(confirmed => {

      if (!confirmed) return;

      var likeItemIndex =  this.selectedElement.ElementItemSet.indexOf(elementItem);

      this.projectService.removeElementItem(elementItem);
      this.projectService.removeElementItem(this.selectedElement.ElementItemSet[likeItemIndex]);

      this.projectService.saveChanges().pipe(
        finalize(() => {
          this.entry = "";
          this.selectedElementCell = null;
          this.loadProject(this.project.Id);
        })).subscribe();
    });

  }

  ngOnInit(): void {

    if (!this.currentUser || !this.currentUser.isAuthenticated()) {
      this.createProjectHistory();
      return;
    }

    this.authService.getUser(this.currentUser.UserName).subscribe(() => {

      for (var i = 0; i < this.currentUser.ProjectSet.length; i++) {

        var project = this.currentUser.ProjectSet[i];

        if (project.Name === "History App") {
          this.project = project;
          this.loadProject(this.project.Id);
          break;
        }
      }

      //if (this.project === null) this.createProjectHistory();
    });
  }

}
