defmodule Drought.DroughtControllerTest do
  use Drought.ConnCase

  alias Drought.Drought
  @valid_attrs %{}
  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, drought_path(conn, :index)
    assert json_response(conn, 200)["data"] == []
  end

  test "shows chosen resource", %{conn: conn} do
    drought = Repo.insert! %Drought{}
    conn = get conn, drought_path(conn, :show, drought)
    assert json_response(conn, 200)["data"] == %{"id" => drought.id}
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, drought_path(conn, :show, -1)
    end
  end

  test "creates and renders resource when data is valid", %{conn: conn} do
    conn = post conn, drought_path(conn, :create), drought: @valid_attrs
    assert json_response(conn, 201)["data"]["id"]
    assert Repo.get_by(Drought, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, drought_path(conn, :create), drought: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "updates and renders chosen resource when data is valid", %{conn: conn} do
    drought = Repo.insert! %Drought{}
    conn = put conn, drought_path(conn, :update, drought), drought: @valid_attrs
    assert json_response(conn, 200)["data"]["id"]
    assert Repo.get_by(Drought, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    drought = Repo.insert! %Drought{}
    conn = put conn, drought_path(conn, :update, drought), drought: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "deletes chosen resource", %{conn: conn} do
    drought = Repo.insert! %Drought{}
    conn = delete conn, drought_path(conn, :delete, drought)
    assert response(conn, 204)
    refute Repo.get(Drought, drought.id)
  end
end
