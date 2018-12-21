import { Injectable } from "@angular/core";
import { Element, ElementField, ElementFieldDataType, ElementItem, ProjectService, Project } from "@forcrowd/backbone-client-core";

import { settings } from "../../settings/settings";

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
      Name: "First Histroy Element"
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
      Name: "Entry 1"
    }) as ElementItem;

    // Cell 1
    super.createElementCell({
      ElementField: elementField,
      ElementItem: elementItem,
      StringValue: "Please edit me"
    });

    return project;
  }

}
