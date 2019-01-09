import { Injectable } from "@angular/core";
import { Element, ElementField, ElementFieldDataType, ElementItem, ProjectService, Project } from "@forcrowd/backbone-client-core";

@Injectable()
export class AppProjectService extends ProjectService {
  createProjectHistory(): Project {
    // Project
    const project = super.createProjectEmpty();
    project.Name = "History App";
    project.Origin = "http://";

    // Element
    const element = super.createElement({
      Project: project,
      Name: "My First Timeline"
    }) as Element;

    // Field
    const elementField = super.createElementField({
      Element: element,
      Name: "New Field",
      DataType: ElementFieldDataType.String,
      SortOrder: 1
    }) as ElementField;

    // Item
    const elementItem = super.createElementItem({
      Element: element,
      Name: "Firt Entry"
    }) as ElementItem;

    // Cell 1
    super.createElementCell({
      ElementField: elementField,
      ElementItem: elementItem,
      StringValue: "Please edit me"
    });

    // Like Dislikes Count
    const elementField2 = super.createElementField({
      Element: element,
      Name: "likes",
      DataType: ElementFieldDataType.Decimal,
      UseFixedValue: false,
      RatingEnabled: false,
      SortOrder: 0
    }) as ElementField;

    // Item
    const elementItem2 = super.createElementItem({
      Element: element,
      Name: "likes"
    }) as ElementItem;

    // Cell
    const cell2 = super.createElementCell({
      ElementField: elementField2,
      ElementItem: elementItem2
    });

    super.createUserElementCell(cell2, 0);

    return project;
  }
}
