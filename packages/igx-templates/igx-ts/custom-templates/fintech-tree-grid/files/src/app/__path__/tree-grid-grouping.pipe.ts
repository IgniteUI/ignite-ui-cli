import { Pipe, PipeTransform } from '@angular/core';

class GroupByRecord {
  public key: any;
  public groups: GroupByRecord[] = [];
  public records: any[] = [];
}

export class ITreeGridAggregation {
  public field: string = '';
  public aggregate: (parent: any, children: any[]) => any = [] as any;
}

@Pipe({
  name: 'treeGridGrouping',
  pure: true
})
export class <%=ClassName%>TreeGridGroupingPipe implements PipeTransform {

  public transform(collection: any[],
           groupColumns: string[],
           aggregations: ITreeGridAggregation[],
           groupKey: string,
           primaryKey: string,
           childDataKey: string): any[] {
    const result: any[] = [];

    const groupedRecords = this.groupByMultiple(collection, groupColumns);
    this.flattenGrouping(groupedRecords, groupKey, primaryKey,
      childDataKey, aggregations, '', result);

    return result;
  }

  private flattenGrouping(groupRecords: GroupByRecord[],
              groupKey: string,
              primaryKey: string,
              childDataKey: string,
              aggregations: ITreeGridAggregation[],
              parentID: any,
              data: any[]) {
    for (const groupRecord of groupRecords) {
      const parent: { [key: string]: any } = {};
      const children = groupRecord.records;

      parent[primaryKey] = parentID + groupRecord.key;
      parent[childDataKey] = [];

      for (const aggregation of aggregations) {
        parent[aggregation.field] = aggregation.aggregate(parent, children);
      }

      parent[groupKey] = groupRecord.key;
      data.push(parent);

      if (groupRecord.groups) {
        this.flattenGrouping(groupRecord.groups, groupKey, primaryKey, childDataKey,
          aggregations, parent[primaryKey], parent[childDataKey]);
      } else {
        parent[childDataKey] = children;
      }
    }
  }

  private groupByMultiple(array: any[], fieldNames: string[], index = 0): GroupByRecord[] {
    const res = this.groupBy(array, fieldNames[index]);

    if (index + 1 < fieldNames.length) {
       for (const groupByRecord of res) {
        groupByRecord.groups = this.groupByMultiple(groupByRecord.records, fieldNames, index + 1);
      }
    }

    return res;
  }

  private groupBy(array: any[], fieldName: string): GroupByRecord[] {
    const map: Map<any, GroupByRecord> = new Map<any, GroupByRecord>();

    for (const record of array) {
      const key = record[fieldName];
      let groupByRecord: GroupByRecord;

      if (map.has(key)) {
        groupByRecord = map.get(key)!;
      } else {
        groupByRecord = new GroupByRecord();
        groupByRecord.key = key;
        groupByRecord.records = [];
        map.set(key, groupByRecord);
      }

      groupByRecord.records.push(record);
    }

    return Array.from(map.values());
  }
}
